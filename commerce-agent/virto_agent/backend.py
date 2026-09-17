"""The ``StorefrontBackend`` over Virto's x-api.

Every method acts for the customer in ``session``: the bearer the theme presented at
session start is read from the token store by session id and sent with the GraphQL call,
so contract prices and organization scoping resolve for the right account and the model
never sees a token, a user id, or an organization id it did not receive inside a fenced
tool result.

Wiring, as recorded in ``CLAUDE.md``:

============================  =========================================================
catalog, cart, orders,        live against x-api
account context, fulfillment
``get_preferences``           a stub: x-api has no preferences object. Returns the bare
                              principal; durable preferences come from memory.
``search_policies``           a stub that raises. ``enable_policies`` stays **on**, so a
                              terms question still forces the read and the agent says the
                              lookup is unavailable instead of answering from its own
                              knowledge of the terms.
``get_disclosure``            absent (``enable_disclosures`` is off)
============================  =========================================================
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from shopping_agent import (
    Cart,
    FulfillmentOption,
    NotOffered,
    Order,
    Policy,
    Product,
    ProductDetails,
    SearchFilters,
    ShoppingSessionContext,
    StorefrontBackend,
    Unavailable,
    UserPreferences,
)

from . import cart_errors, mapping, xapi
from .context import SessionSignedOut
from .mapping import MAX_VARIANTS_IN_ONE_RECORD
from .settings import Settings

logger = logging.getLogger(__name__)

# One page of variations. A family past MAX_VARIANTS_IN_ONE_RECORD is split by its leading
# option, but the whole matrix is still read to work out what the legs are.
VARIATION_PAGE = 50
# One page over this catalog's 433 categories, read once per process.
CATEGORY_TREE_PAGE = 1000
MAX_VARIATION_PAGES = 10

_SORT_EXPRESSIONS = {
    "relevance": "",
    "price_asc": "price-ascending",
    "price_desc": "price-descending",
    # The platform's sorting list has no rating option; the ranking is applied here.
    "rating": "",
}


# Distinguishes "not read yet" from "the store has no catalog id".
_UNREAD = object()


class UnknownCategory(Exception):
    """``filters.category`` named something this catalog has no category for.

    Relayed to the model rather than dropped. A filter that vanishes silently is the worst
    of the three outcomes: the model believes it searched an aisle it never searched, and
    reports the catalog's failure as the store's. ``candidates`` are the catalog's own
    near matches and ``top_level`` its whole top row, so the recovery is in the message
    (commerce-builder's "errors as instructions"). A synonym the catalog does not use
    anywhere - "beverages", "helmets" - produces no candidates at all, which is why the
    top row travels too: it is the only thing that bridges a vocabulary gap, since
    nothing in this store's index maps one word onto another.
    """

    def __init__(self, name: str, candidates: list[str], top_level: list[str]) -> None:
        super().__init__(name)
        self.name = name
        self.candidates = candidates
        self.top_level = top_level


class NeedsConfiguration(Exception):
    """A configurable product: it is sold, but a line is built from configuration
    sections (``getProductConfigurations`` / ``changeCartConfiguredItem``), which the
    blueprint's catalog shapes do not model and the cart provenance gate has no answer
    for. Mapped by :class:`~virto_agent.executor.VirtoShoppingExecutor` so the model
    sends the customer to the product page instead of reporting an outage.

    TODO: decide whether a configuration id can satisfy the provenance gate, or whether
    configurable products need a fourth catalog shape, before wiring the cart path.
    """


class VirtoStorefrontBackend(StorefrontBackend):
    def __init__(self, *, client: xapi.XapiClient, settings: Settings) -> None:
        self._client = client
        self._settings = settings
        # Catalog shape, not customer data: the same for every session, so both are read
        # once per process. A name that resolved to nothing is cached as "" so a second
        # ask for it costs no round trip.
        self._catalog_id_cache: str | None | object = _UNREAD
        self._categories: dict[str, tuple[list[str], list[str]]] = {}
        self._top_level: list[str] | None = None

    # -- plumbing ----------------------------------------------------------------------

    async def _call(
        self, session: ShoppingSessionContext, document: str, variables: dict[str, Any]
    ) -> dict[str, Any]:
        """Every call carries the request's own bearer, which the service put on the
        context (:class:`~virto_agent.context.VirtoSessionContext`). The base class types
        the parameter as the plain context, so the token is read off it rather than
        declared, and its absence is the signed-out case rather than an attribute error."""
        token = getattr(session, "access_token", None)
        if not token:
            raise SessionSignedOut(session.session_id)
        return await self._client.execute(document, variables, token=str(token))

    def _store_variables(self, session: ShoppingSessionContext) -> dict[str, Any]:
        return {
            "storeId": self._settings.store_id,
            "userId": session.user_id,
            "currencyCode": self._settings.currency_code,
            "cultureName": self._settings.culture_name,
        }

    # -- Catalog -----------------------------------------------------------------------

    async def search_products(
        self,
        session: ShoppingSessionContext,
        query: str,
        filters: SearchFilters | None = None,
        limit: int = 8,
    ) -> list[Product]:
        """Text search over the store's catalog.

        ``SearchFilters.category`` carries a category *name*, as the tool schema tells the
        model it does, and is resolved against the catalog's own tree. Whether a name is
        better asked as text or as a category is not decidable in advance — measured on
        this catalog, "soft drinks" as text returns nothing and as a category seventeen,
        while "bolts" as text returns twenty and as a category nine — so neither is
        preferred here. What is enforced is that the model is never told a filter was
        applied when it was not: an unresolvable name raises :class:`UnknownCategory`.

        ``min_rating`` has no filter grammar and is applied in this method. Domain
        dimensions arrive in ``filters.attributes`` and become property terms.
        """
        filters = filters or SearchFilters()
        text = query or ""
        category_term = (
            await self._category_term(session, filters.category) if filters.category else ""
        )
        filter_expression = self._filter_expression(filters, category_term)
        if not text and not filter_expression:
            # Otherwise x-api answers with the catalog's first page, which reads as an
            # answer and is not one: a "helmets" search that resolved to no category and
            # carried no text came back as twenty printers.
            raise NotOffered("a search needs something to search for")
        variables = {
            **self._store_variables(session),
            "query": text or None,
            "filter": filter_expression or None,
            "sort": _SORT_EXPRESSIONS.get(filters.sort) or None,
            "first": limit,
            "fuzzy": True,
            "fuzzyLevel": None,
            "productIds": None,
        }
        records = await self._first_hit(session, variables, has_category=bool(category_term))
        if filters.min_rating is not None:
            records = [
                record
                for record in records
                if float((record.get("rating") or {}).get("value") or 0) >= filters.min_rating
            ]
        options = await self._option_names_for(session, records)
        products = [
            mapping.product_from(
                record,
                currency=self._settings.currency_code,
                options=options.get(str(record["id"]), {}),
            )
            for record in records
        ]
        if filters.sort == "rating":
            products.sort(key=lambda product: product.rating or 0, reverse=True)
        return products

    async def _catalog_id(self, session: ShoppingSessionContext) -> str | None:
        """The store's catalog, read once per process. The category filter is prefixed
        with it, as the theme's own ``getFilterExpressionForCategorySubtree`` is."""
        if self._catalog_id_cache is _UNREAD:
            data = await self._call(session, xapi.GET_STORE, {"storeId": self._settings.store_id})
            self._catalog_id_cache = str((data.get("store") or {}).get("catalogId") or "") or None
            if self._catalog_id_cache is None:
                logger.warning("store %r reports no catalog id; category filters are off",
                               self._settings.store_id)
        return self._catalog_id_cache

    async def _top_level_categories(self, session: ShoppingSessionContext) -> list[str]:
        """The catalog's top row of category names, read once per process.

        This is the store's own vocabulary for what it sells, and the model has no other
        way to learn it: the text index does not match category names, ``categories`` is
        a plain text search that answers a synonym with nothing, and the reference's
        ``compact_product`` drops ``Product.category`` from a search result. Without it a
        model asked for "canned drinks" guesses "Beverages", is told there is no such
        category, and concludes the store sells no drinks - which is what happened.
        """
        if self._top_level is None:
            data = await self._call(
                session,
                xapi.CATEGORY_TREE,
                {**self._store_variables(session), "first": CATEGORY_TREE_PAGE},
            )
            items = ((data.get("categories") or {}).get("items")) or []
            self._top_level = sorted(
                {
                    str(item["name"]).strip()
                    for item in items
                    if int(item.get("level") or 0) == 1 and item.get("name")
                }
            )
            logger.info("catalog top-level categories: %d", len(self._top_level))
        return self._top_level

    async def _resolve_category(
        self, session: ShoppingSessionContext, name: str
    ) -> tuple[list[str], list[str]]:
        """Every category id named exactly ``name``, or none plus what the catalog has.

        Only an **exact** name match counts, compared case-insensitively. The lookup is a
        text search over this catalog's 433 categories, so a near miss is common and
        confident: it answers "bolts" with *Flange Bolts* (9 products) alongside the plain
        *Bolts* (32), and "juice" with *Juice & syrup* alongside *Juice*. Taking the first
        would search a different aisle than the one asked for and never say so.

        A name used more than once returns all of them, because which one the customer
        meant is not decidable here and picking is worse than including: this catalog files
        *Juice* at level 1 with nothing in it and again at level 2 with two products, and
        *Laptops* the same way round. The union answers both.
        """
        wanted = name.strip()
        data = await self._call(
            session,
            xapi.SEARCH_CATEGORIES,
            {**self._store_variables(session), "query": wanted, "first": 25},
        )
        items = ((data.get("categories") or {}).get("items")) or []
        exact = [
            str(item["id"])
            for item in items
            if str(item.get("name") or "").strip().casefold() == wanted.casefold()
        ]
        if exact:
            return exact, []
        return [], [str(item.get("name") or "") for item in items if item.get("name")]

    async def _category_term(self, session: ShoppingSessionContext, name: str) -> str:
        """``category.subtree:`` over the named category. Raises when it does not exist.

        Several ids become one term: the grammar takes comma-separated quoted values and
        reads them as a union, which is how one name filed twice is searched at once.
        """
        key = name.strip().casefold()
        if key not in self._categories:
            self._categories[key] = await self._resolve_category(session, name)
        category_ids, candidates = self._categories[key]
        if not category_ids:
            raise UnknownCategory(
                name.strip(), candidates, await self._top_level_categories(session)
            )

        catalog_id = await self._catalog_id(session)
        if not catalog_id:
            raise UnknownCategory(name.strip(), [], [])
        values = ",".join(f'"{catalog_id}/{category_id}"' for category_id in category_ids)
        return f"category.subtree:{values}"

    async def _first_hit(
        self,
        session: ShoppingSessionContext,
        variables: dict[str, Any],
        *,
        has_category: bool,
    ) -> list[dict[str, Any]]:
        """The search ladder: each rung loosens one thing, and the first with hits wins.

        The store's index matches product text only, with no stemming and no notion of a
        category name, so a single pass answers a precise question well and a natural one
        badly. Each rung below drops exactly one constraint, in the order that keeps the
        customer's own words longest:

        1. **As asked** — the model's text inside the model's category.
        2. **The category alone**, when one resolved. The category is the aisle the
           customer named and the text was the model's narrowing of it; an empty aisle
           means the narrowing was wrong, not that the aisle is bare. This rung is skipped
           when no category resolved, because dropping the text would then search the
           whole catalog.
        3. **The text at ``fuzzyLevel`` 1.** The index does not stem — "carriage bolts"
           matches nothing while "carriage bolt" matches six — and a model writes the
           customer's own plural. ``fuzzy`` alone is inert; only a level engages it. Level
           2 broadens far too much ("glove" goes from 4 matches to 615).

        A rung that *thins* the result rather than emptying it is not a failure this can
        see, and is left to ``domain_search_notes`` to prevent.
        """
        text = variables.get("query")
        rungs: list[tuple[str, dict[str, Any]]] = [("as asked", variables)]
        if has_category and text:
            rungs.append(("the category alone", {**variables, "query": None}))
        if text:
            rungs.append(("fuzzyLevel 1", {**variables, "fuzzyLevel": 1}))

        for name, attempt in rungs:
            records = await self._search(session, attempt)
            if records:
                if name != "as asked":
                    logger.info("empty result for %r; %s returned %d", text, name, len(records))
                return records
        return []

    async def _search(
        self, session: ShoppingSessionContext, variables: dict[str, Any]
    ) -> list[dict[str, Any]]:
        data = await self._call(session, xapi.SEARCH_PRODUCTS, variables)
        return ((data.get("products") or {}).get("items")) or []

    def _filter_expression(self, filters: SearchFilters, category_term: str | None = None) -> str:
        """Virto's filter syntax; see the experience-api filter-syntax docs."""
        currency = self._settings.currency_code.lower()
        terms: list[str] = [category_term] if category_term else []
        if filters.min_price is not None or filters.max_price is not None:
            low = "" if filters.min_price is None else f"{filters.min_price:g}"
            high = "" if filters.max_price is None else f"{filters.max_price:g}"
            terms.append(f"price.{currency}:({low} TO {high})")
        for name, value in filters.attributes.items():
            terms.append(f'"{name}":"{value}"')
        return " ".join(terms)

    async def _option_names_for(
        self, session: ShoppingSessionContext, records: list[dict[str, Any]]
    ) -> dict[str, dict[str, list[str]]]:
        """Option names for the families on a results page, so the cart's options gate
        holds an add of one and names what is still to choose.

        The names come from the master's own ``VARIATION`` properties where it carries
        them; a master that carries none costs one extra read of a single variation. The
        values stay empty here — they live on the variations, and the model reads them
        from ``get_product_details``, which it needs anyway for the variant ids.
        """
        families = [record for record in records if record.get("hasVariations")]
        if not families:
            return {}

        async def names_for(record: dict[str, Any]) -> tuple[str, dict[str, list[str]]]:
            master_id = str(record["id"])
            names = mapping.option_names_of(record.get("properties"))
            if not names:
                sample = await self._fetch_variations(session, master_id, first=1)
                names = mapping.option_names_of(
                    (sample[0].get("properties") if sample else None) or []
                )
            return master_id, {name: [] for name in names}

        return dict(await asyncio.gather(*(names_for(record) for record in families)))

    async def get_product_details(
        self, session: ShoppingSessionContext, product_id: str
    ) -> ProductDetails | None:
        """The full record for one id.

        A master product comes back as a family with its variants. A family with more
        variants than one fenced result holds is split by its leading option: the record
        carries one sub-family per value of that option, under a synthesized ``fam:`` id
        which this method resolves back to the matching slice.
        """
        if (split := mapping.parse_split_family_id(product_id)) is not None:
            master_id, option, value = split
            return await self._family_details(
                session, master_id, restrict=(option, value), record_id=product_id
            )
        record = await self._fetch_product(session, product_id)
        if record is None:
            return None
        if record.get("hasVariations"):
            return await self._family_details(session, product_id, record=record)
        return mapping.details_from(
            record,
            currency=self._settings.currency_code,
            options={},
            variants=[],
            master_id=self._master_of(record),
            long_description=(record.get("description") or {}).get("content"),
        )

    def _master_of(self, record: dict[str, Any]) -> str | None:
        master = (record.get("masterVariation") or {}).get("id")
        return str(master) if master and str(master) != str(record["id"]) else None

    async def _fetch_product(
        self, session: ShoppingSessionContext, product_id: str
    ) -> dict[str, Any] | None:
        data = await self._call(
            session,
            xapi.GET_PRODUCT,
            {
                "storeId": self._settings.store_id,
                "currencyCode": self._settings.currency_code,
                "cultureName": self._settings.culture_name,
                "id": product_id,
            },
        )
        return data.get("product")

    async def _fetch_variations(
        self, session: ShoppingSessionContext, master_id: str, *, first: int = VARIATION_PAGE
    ) -> list[dict[str, Any]]:
        """Every variation of a master, as the theme's own variation picker fetches them."""
        data = await self._call(
            session,
            xapi.SEARCH_PRODUCTS,
            {
                **self._store_variables(session),
                "query": None,
                "filter": f"productfamilyid:{master_id} is:product,variation",
                "sort": None,
                "first": first,
                "fuzzy": False,
                "fuzzyLevel": None,
                "productIds": None,
            },
        )
        return ((data.get("products") or {}).get("items")) or []

    async def _family_details(
        self,
        session: ShoppingSessionContext,
        master_id: str,
        *,
        record: dict[str, Any] | None = None,
        restrict: tuple[str, str] | None = None,
        record_id: str | None = None,
    ) -> ProductDetails | None:
        master = record or await self._fetch_product(session, master_id)
        if master is None:
            return None
        rows = await self._fetch_variations(
            session, master_id, first=VARIATION_PAGE * MAX_VARIATION_PAGES
        )
        variants = [
            mapping.product_from(
                row, currency=self._settings.currency_code, master_id=master_id
            )
            for row in rows
        ]
        long_description = (master.get("description") or {}).get("content")

        if restrict is not None:
            option, value = restrict
            variants = [v for v in variants if v.option_values.get(option) == value]
            if not variants:
                return None
            options = mapping.options_from_variants(variants)
            options.pop(option, None)
            details = mapping.details_from(
                master,
                currency=self._settings.currency_code,
                options=options,
                variants=variants,
                long_description=long_description,
            )
            return details.model_copy(
                update={
                    "price": mapping.family_price(variants, details.price),
                    "product_id": record_id or mapping.split_family_id(master_id, option, value),
                    "title": f"{details.title} — {option}: {value}",
                    "option_values": {option: value},
                    "variant_of": master_id,
                }
            )

        options = mapping.options_from_variants(variants)
        if len(variants) > MAX_VARIANTS_IN_ONE_RECORD and options:
            leading = next(iter(options))
            remaining = {name: values for name, values in options.items() if name != leading}
            variants = [
                mapping.sub_family(
                    master,
                    currency=self._settings.currency_code,
                    option=leading,
                    value=value,
                    remaining_options=remaining,
                )
                for value in options[leading]
            ]
            options = {leading: options[leading]}
        details = mapping.details_from(
            master,
            currency=self._settings.currency_code,
            options=options,
            variants=variants,
            long_description=long_description,
        )
        return details.model_copy(update={"price": mapping.family_price(variants, details.price)})

    # -- Cart --------------------------------------------------------------------------

    async def _fetch_cart(self, session: ShoppingSessionContext) -> dict[str, Any] | None:
        data = await self._call(session, xapi.GET_FULL_CART, self._store_variables(session))
        return data.get("cart")

    async def get_cart(self, session: ShoppingSessionContext) -> Cart:
        return mapping.cart_from(
            await self._fetch_cart(session), currency=self._settings.currency_code
        )

    async def add_to_cart(
        self, session: ShoppingSessionContext, product_id: str, quantity: int
    ) -> Cart:
        """Add a line. The executor's gates have already checked provenance, held an add
        of a family, and capped the quantity; what is checked here is what only the
        platform knows.

        x-api's ``addItem`` takes no idempotency key, so a retried add is a second add.
        TODO: guard the retry in this method (a session-scoped key over the cart lines)
        if the service ever retries a failed mutation.
        """
        record = await self._fetch_product(session, product_id)
        if record is None:
            raise Unavailable(f"{product_id} is no longer in the catalog")
        if record.get("isConfigurable"):
            raise NeedsConfiguration(product_id)
        if not mapping.in_stock(record):
            raise Unavailable(await self._out_of_stock_detail(session, record))
        data = await self._call(
            session,
            xapi.ADD_ITEM,
            {
                "command": {
                    **self._store_variables(session),
                    "productId": product_id,
                    "quantity": quantity,
                }
            },
        )
        self._raise_if_refused(data, "addItem", product_id=product_id)
        return await self.get_cart(session)

    @staticmethod
    def _raise_if_refused(
        data: dict[str, Any], field: str, *, product_id: str | None = None
    ) -> None:
        """A cart write that x-api answered 200 to may still have written nothing.

        The reason is on the mutation payload and nowhere else, so it is read here and
        relayed as :class:`Unavailable`, which the reference executor hands to the model as
        a sentence it can act on rather than as an outage.
        """
        payload = data.get(field) or {}
        detail = cart_errors.failure_text(payload.get("validationErrors"), product_id=product_id)
        if detail:
            raise Unavailable(detail)

    async def _out_of_stock_detail(
        self, session: ShoppingSessionContext, record: dict[str, Any]
    ) -> str:
        """Ids only: what is out, and which siblings are in stock.

        The family to read is the record's master when it is a variant, and the record
        itself when it is a master that cannot be bought — the catalog has families whose
        distinguishing attribute is a plain property rather than a ``VARIATION`` one, so
        such a master reaches here with no options to have been held on.
        """
        product_id = str(record["id"])
        master_id = self._master_of(record) or (product_id if record.get("hasVariations") else None)
        if master_id is None:
            return f"{product_id} is out of stock"
        siblings = mapping.in_stock_siblings(
            [
                mapping.product_from(
                    row, currency=self._settings.currency_code, master_id=master_id
                )
                for row in await self._fetch_variations(session, master_id)
            ]
        )
        if not siblings:
            return f"{product_id} is out of stock and no other variant is in stock"
        return f"{product_id} is out of stock; in stock: {', '.join(siblings)}"

    async def update_cart_item(
        self, session: ShoppingSessionContext, product_id: str, quantity: int
    ) -> Cart:
        cart = await self._fetch_cart(session)
        line_item_id = mapping.line_item_id_for(cart, product_id)
        if line_item_id is None:
            return mapping.cart_from(cart, currency=self._settings.currency_code)
        data = await self._call(
            session,
            xapi.CHANGE_ITEM_QUANTITY,
            {
                "command": {
                    **self._store_variables(session),
                    "lineItemId": line_item_id,
                    "quantity": quantity,
                }
            },
        )
        self._raise_if_refused(data, "changeCartItemQuantity", product_id=product_id)
        return await self.get_cart(session)

    async def remove_from_cart(self, session: ShoppingSessionContext, product_id: str) -> Cart:
        cart = await self._fetch_cart(session)
        line_item_id = mapping.line_item_id_for(cart, product_id)
        if line_item_id is None:
            return mapping.cart_from(cart, currency=self._settings.currency_code)
        data = await self._call(
            session,
            xapi.REMOVE_CART_ITEMS,
            {
                "command": {
                    **self._store_variables(session),
                    "lineItemIds": [line_item_id],
                }
            },
        )
        self._raise_if_refused(data, "removeCartItems", product_id=product_id)
        return await self.get_cart(session)

    # -- Customer context ----------------------------------------------------------------

    async def get_preferences(self, session: ShoppingSessionContext) -> UserPreferences:
        """x-api has no preferences object, so this returns the principal and nothing else.

        What the store knows about a customer's standing choices comes from memory, which
        is designed to fill exactly this. TODO: synthesize from wishlists, recently
        browsed, and the organization's defaults, or add a preferences store.
        """
        return UserPreferences(user_id=session.user_id)

    async def get_account_context(self, session: ShoppingSessionContext) -> dict[str, Any] | None:
        """The B2B facts every turn is answered against: who the customer is buying for and
        what they are allowed to do. Sent on every request, so it stays small."""
        data = await self._call(session, xapi.GET_ME, {})
        me = data.get("me") or {}
        contact = me.get("contact") or {}
        organization = contact.get("organization") or {}
        context = {
            "name": contact.get("fullName"),
            "organization": organization.get("name"),
            "roles": [role.get("name") for role in me.get("roles") or [] if role.get("name")],
            "currency": contact.get("currencyCode") or self._settings.currency_code,
        }
        return {key: value for key, value in context.items() if value}

    # -- Orders and policies ---------------------------------------------------------------

    async def get_orders(self, session: ShoppingSessionContext, limit: int = 5) -> list[Order]:
        """The customer's own orders. x-api scopes ``orders`` to the bearer, so no user id
        is passed: the credential is the scope."""
        data = await self._call(
            session,
            xapi.GET_ORDERS,
            {"first": limit, "sort": "createdDate:desc", "cultureName": self._settings.culture_name},
        )
        records = ((data.get("orders") or {}).get("items")) or []
        return [mapping.order_from(record) for record in records]

    async def get_order(self, session: ShoppingSessionContext, order_id: str) -> Order | None:
        """One order by the number the customer sees, falling back to the platform id."""
        for variables in (
            {"number": order_id, "id": None},
            {"number": None, "id": order_id},
        ):
            data = await self._call(
                session,
                xapi.GET_ORDER,
                {**variables, "cultureName": self._settings.culture_name},
            )
            if record := data.get("order"):
                return mapping.order_from(record)
        return None

    async def search_policies(self, session: ShoppingSessionContext, query: str) -> list[Policy]:
        """Not wired. x-api serves CMS pages (``getPage`` / ``getPageDocument``) but has no
        search across them, and a returns or shipping question is exactly the one the
        agent must answer from a retrieved passage.

        The raise reaches the model as "temporarily unavailable", which is the truth and
        keeps it from answering the store's terms from its own knowledge.

        TODO: index a curated set of policy pages here, or expose CMS search in x-api.
        """
        raise NotImplementedError("search_policies is not wired to a policy source yet")

    # -- Fulfillment ------------------------------------------------------------------------

    async def get_fulfillment_options(
        self, session: ShoppingSessionContext, product_ids: list[str]
    ) -> list[FulfillmentOption]:
        """The shipping methods available for the session's cart.

        x-api resolves fulfillment per cart, not per product, so ``product_ids`` does not
        narrow the result; the options returned are the ones that apply to the whole
        basket. The platform quotes no delivery date on a shipping method, so ``eta``
        carries the method's own description rather than a date invented here.

        TODO: add pickup locations (``getCartPickupLocations``) as ``method="pickup"``.
        """
        cart = await self._fetch_cart(session)
        methods = (cart or {}).get("availableShippingMethods") or []
        return [
            FulfillmentOption(
                method="shipping",
                eta=str(
                    method.get("optionDescription") or method.get("optionName") or "no date quoted"
                ),
                fee=float((method.get("price") or {}).get("amount") or 0.0),
            )
            for method in methods
        ]
