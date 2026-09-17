"""x-api records translated into the blueprint's types.

Which platform object becomes which shape:

``Product`` (plain)
    A ``ProductType`` with ``hasVariations: false``. Its id is the platform's product id,
    passed through unchanged.
``Product`` (family)
    A master ``ProductType`` with ``hasVariations: true``. Its ``options`` are the names
    of its variations' ``VARIATION`` properties; in a search result the value lists are
    empty, because the values live on the variations and a search does not fetch them —
    the model reads the names, sees a family, and calls ``get_product_details``.
``Product`` (variant)
    A variation ``ProductType``, fetched by ``productfamilyid:<master> is:product,variation``.
    Its ``option_values`` are its own ``VARIATION`` properties and ``variant_of`` is the
    master's id.
``Product`` (split sub-family)
    Synthesized here, not a platform object: a family past
    :data:`MAX_VARIANTS_IN_ONE_RECORD` is served as one sub-family per value of its leading
    option, under the opaque id ``fam:<masterId>:<option>=<value>``. Ids are opaque strings
    throughout, so a synthesized one travels like any other.

A one-variant product carries the **variation's** id in the cart, as every variant does;
its master id is what search returns and what ``get_product_details`` resolves.
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any

from shopping_agent import (
    Cart,
    CartItem,
    Order,
    OrderItem,
    OrderStatus,
    Product,
    ProductDetails,
)

logger = logging.getLogger(__name__)

VARIATION_PROPERTY = "VARIATION"
FAMILY_ID_PREFIX = "fam:"

# A compact variant row is 70-120 characters and ``max_fenced_chars`` is 12,000, so a
# record holds about sixty. Past this many the family is split by its leading option;
# below it the whole matrix travels in one result.
MAX_VARIANTS_IN_ONE_RECORD = 40

# Attributes are prompt bytes on every search result, so only the ones that change a
# B2B decision are carried.
_MAX_ATTRIBUTES = 12

# Prices resolve against the signed-in organization's contract, so a quoted figure holds
# for this account and not for the catalog at large.
PRICE_CONTEXT = "contract price for the signed-in organization"


def split_family_id(master_id: str, option: str, value: str) -> str:
    return f"{FAMILY_ID_PREFIX}{master_id}:{option}={value}"


def parse_split_family_id(product_id: str) -> tuple[str, str, str] | None:
    """``(master_id, option, value)`` for a synthesized sub-family id, else None."""
    if not product_id.startswith(FAMILY_ID_PREFIX):
        return None
    body = product_id[len(FAMILY_ID_PREFIX) :]
    master_id, _, tail = body.rpartition(":")
    option, _, value = tail.partition("=")
    if not master_id or not option or not value:
        return None
    return master_id, option, value


def _property_value(prop: dict[str, Any]) -> str:
    value = prop.get("value")
    if value is None:
        return ""
    if isinstance(value, bool):
        return "yes" if value else "no"
    return str(value)


def option_values_of(properties: list[dict[str, Any]] | None) -> dict[str, str]:
    """A variation's option values: its ``VARIATION`` properties, label to value.

    A property repeated under one name (a multi-colour item) is joined, as the theme's
    own variation picker does, so one variant has one value per option.
    """
    grouped: dict[str, list[dict[str, Any]]] = {}
    for prop in properties or []:
        if prop.get("propertyType") != VARIATION_PROPERTY:
            continue
        grouped.setdefault(str(prop.get("label") or prop.get("name") or ""), []).append(prop)
    values: dict[str, str] = {}
    for label, props in grouped.items():
        if not label:
            continue
        ordered = sorted(props, key=lambda p: p.get("valueDisplayOrder") or 0)
        joined = ", ".join(v for p in ordered if (v := _property_value(p)))
        if joined:
            values[label] = joined
    return values


def option_names_of(properties: list[dict[str, Any]] | None) -> list[str]:
    """The ``VARIATION`` property names on a record, in display order and without repeats."""
    seen: dict[str, int] = {}
    for prop in properties or []:
        if prop.get("propertyType") != VARIATION_PROPERTY:
            continue
        label = str(prop.get("label") or prop.get("name") or "")
        if label and label not in seen:
            seen[label] = int(prop.get("displayOrder") or len(seen))
    return sorted(seen, key=lambda label: seen[label])


def options_from_variants(variants: list[Product]) -> dict[str, list[str]]:
    """Every option and its values in first-seen order, across a family's variants."""
    options: dict[str, list[str]] = {}
    for variant in variants:
        for option, value in variant.option_values.items():
            values = options.setdefault(option, [])
            if value not in values:
                values.append(value)
    return options


def visible_attributes(record: dict[str, Any]) -> dict[str, str]:
    """The non-variation properties a buyer would use, plus the B2B facts x-api keeps off
    the property list: the sku, the order minimum, and the pack size."""
    attributes: dict[str, str] = {}
    if code := record.get("code"):
        attributes["sku"] = str(code)
    if (minimum := record.get("minQuantity")) and int(minimum) > 1:
        attributes["minimum_order_quantity"] = str(minimum)
    # The ceiling as well as the floor: x-api refuses an add outside either with one
    # PRODUCT_MIN_MAX_QTY, and a model that can read both limits does not provoke it.
    # `maxQuantity` is 0 where the catalog sets no ceiling.
    if (maximum := record.get("maxQuantity")) and int(maximum) > 0:
        attributes["maximum_order_quantity"] = str(maximum)
    if (pack := record.get("packSize")) and int(pack) > 1:
        attributes["pack_size"] = str(pack)
    if record.get("isConfigurable"):
        attributes["configurable"] = "built to order on its own page"
    attributes["price_context"] = PRICE_CONTEXT
    # The reference's compact_product drops Product.category, so this is the only way the
    # model ever learns a category name the catalog actually uses.
    category = _category_of(record)
    if category:
        attributes["category"] = category
    for prop in record.get("properties") or []:
        if prop.get("propertyType") == VARIATION_PROPERTY or prop.get("hidden"):
            continue
        label = str(prop.get("label") or prop.get("name") or "")
        value = _property_value(prop)
        if label and value and label not in attributes and len(attributes) < _MAX_ATTRIBUTES:
            attributes[label] = value
    return attributes


def _amount(money: dict[str, Any] | None) -> float:
    return float((money or {}).get("amount") or 0.0)


def _price_of(record: dict[str, Any]) -> float:
    price = record.get("price") or {}
    # A family quotes its lowest variation price; x-api computes that as minVariationPrice.
    if record.get("hasVariations") and (lowest := record.get("minVariationPrice")):
        return _amount((lowest or {}).get("actual"))
    return _amount(price.get("actual"))


def _currency_of(record: dict[str, Any], fallback: str) -> str:
    currency = (record.get("price") or {}).get("currency")
    if isinstance(currency, dict):
        return str(currency.get("code") or fallback)
    return str(currency or fallback)


def _category_of(record: dict[str, Any]) -> str | None:
    crumbs = [c for c in record.get("breadcrumbs") or [] if c.get("typeName") == "Category"]
    return str(crumbs[-1].get("title")) if crumbs else None


def in_stock(record: dict[str, Any]) -> bool:
    availability = record.get("availabilityData") or {}
    return bool(
        availability.get("isActive")
        and availability.get("isAvailable")
        and availability.get("isBuyable")
        and availability.get("isInStock")
    )


def product_from(
    record: dict[str, Any],
    *,
    currency: str,
    options: dict[str, list[str]] | None = None,
    master_id: str | None = None,
) -> Product:
    """One catalog record. ``options`` marks it a family; ``master_id`` marks it a variant.

    A master is returned among its own ``productfamilyid`` rows and is purchasable in its
    own right, so a record whose id is the master's is not a variant of itself: it keeps
    ``variant_of`` unset and is listed beside its siblings.
    """
    rating = record.get("rating") or {}
    description = (record.get("description") or {}).get("content")
    vendor = (record.get("vendor") or {}).get("name")
    product_id = str(record["id"])
    if master_id == product_id:
        master_id = None
    return Product(
        product_id=product_id,
        title=str(record.get("name") or record.get("code") or record["id"]),
        brand=str(vendor) if vendor else None,
        price=_price_of(record),
        currency=_currency_of(record, currency),
        rating=rating.get("value"),
        review_count=rating.get("reviewCount"),
        image_url=record.get("imgSrc"),
        category=_category_of(record),
        attributes=visible_attributes(record),
        in_stock=in_stock(record),
        short_description=str(description) if description else None,
        options=options or {},
        option_values=option_values_of(record.get("properties")) if master_id else {},
        variant_of=master_id,
    )


def details_from(
    record: dict[str, Any],
    *,
    currency: str,
    options: dict[str, list[str]],
    variants: list[Product],
    master_id: str | None = None,
    long_description: str | None = None,
) -> ProductDetails:
    base = product_from(record, currency=currency, options=options, master_id=master_id)
    return ProductDetails(
        **base.model_dump(),
        long_description=long_description,
        variants=variants,
    )


def sub_family(
    master: dict[str, Any],
    *,
    currency: str,
    option: str,
    value: str,
    remaining_options: dict[str, list[str]],
) -> Product:
    """One leg of a split family: a family in its own right, under a synthesized id."""
    product = product_from(master, currency=currency, options=remaining_options)
    return product.model_copy(
        update={
            "product_id": split_family_id(master["id"], option, value),
            "title": f"{product.title} — {option}: {value}",
            "option_values": {option: value},
            "variant_of": str(master["id"]),
        }
    )


# -- Cart --------------------------------------------------------------------------------


def cart_from(record: dict[str, Any] | None, *, currency: str) -> Cart:
    record = record or {}
    currency_code = str(((record.get("currency") or {}).get("code")) or currency)
    items = []
    for line in record.get("items") or []:
        product = line.get("product") or {}
        master = (product.get("masterVariation") or {}).get("id")
        product_id = str(line.get("productId") or product.get("id") or "")
        if not product_id:
            continue
        items.append(
            CartItem(
                product_id=product_id,
                title=str(line.get("name") or product_id),
                price=_amount(line.get("placedPrice")),
                quantity=max(1, int(line.get("quantity") or 1)),
                image_url=line.get("imageUrl"),
                option_values=option_values_of(product.get("properties")),
                variant_of=str(master) if master and str(master) != product_id else None,
            )
        )
    return Cart(items=items, currency=currency_code)


def line_item_id_for(record: dict[str, Any] | None, product_id: str) -> str | None:
    """The cart's line id for a product id. x-api's quantity and removal mutations are
    keyed by line item, so every write resolves this from a fresh read of the cart."""
    for line in (record or {}).get("items") or []:
        if str(line.get("productId") or "") == product_id:
            return str(line.get("id"))
    return None


def family_price(variants: list[Product], fallback: float) -> float:
    """A family's "from" price: its lowest in-stock variant's, per ``docs/backends.md``.

    Computed here rather than read from ``minVariationPrice``, which the ``product``
    query leaves null — it is filled by the search index, not the product resolver — and
    which would otherwise make search and details quote different figures for one family.
    """
    in_stock_prices = [variant.price for variant in variants if variant.in_stock]
    prices = in_stock_prices or [variant.price for variant in variants]
    return min(prices) if prices else fallback


def in_stock_siblings(variants: list[Product]) -> list[str]:
    return [variant.product_id for variant in variants if variant.in_stock]


# -- Orders ------------------------------------------------------------------------------

# x-api's order status is the store's own dictionary, not a fixed enum. These are the
# names the platform ships with; an unmapped one reads as "processing".
# TODO: confirm the store's configured status list on QA and extend this map.
_ORDER_STATUS = {
    "new": OrderStatus.PROCESSING,
    "pending": OrderStatus.PROCESSING,
    "processing": OrderStatus.PROCESSING,
    "payed": OrderStatus.PROCESSING,
    "paid": OrderStatus.PROCESSING,
    "confirmed": OrderStatus.PROCESSING,
    "shipped": OrderStatus.SHIPPED,
    "sent": OrderStatus.SHIPPED,
    "out for delivery": OrderStatus.OUT_FOR_DELIVERY,
    "delivered": OrderStatus.DELIVERED,
    "completed": OrderStatus.DELIVERED,
    "delayed": OrderStatus.DELAYED,
    "cancelled": OrderStatus.CANCELLED,
    "canceled": OrderStatus.CANCELLED,
    "refunded": OrderStatus.REFUNDED,
    "returned": OrderStatus.RETURN_INITIATED,
}


def order_status_from(status: str | None) -> OrderStatus:
    key = (status or "").strip().lower()
    mapped = _ORDER_STATUS.get(key)
    if mapped is None:
        logger.warning("unmapped x-api order status %r; reported as processing", status)
        return OrderStatus.PROCESSING
    return mapped


def order_from(record: dict[str, Any]) -> Order:
    """One order. x-api carries no tracking URL and no promised delivery date on the order
    itself, so both stay unset rather than being filled with a stand-in; a shipment's
    ``deliveryDate`` is used when the store records one."""
    items = []
    for line in record.get("items") or []:
        product = line.get("product") or {}
        master = (product.get("masterVariation") or {}).get("id")
        product_id = str(line.get("productId") or product.get("id") or "")
        if not product_id:
            continue
        items.append(
            OrderItem(
                product_id=product_id,
                title=str(line.get("name") or product_id),
                quantity=int(line.get("quantity") or 1),
                price=_amount(line.get("placedPrice")),
                option_values=option_values_of(product.get("properties")),
                variant_of=str(master) if master and str(master) != product_id else None,
            )
        )
    delivery = next(
        (s.get("deliveryDate") for s in record.get("shipments") or [] if s.get("deliveryDate")),
        None,
    )
    return Order(
        order_id=str(record.get("number") or record["id"]),
        status=order_status_from(record.get("status")),
        placed_at=_parsed_date(record.get("createdDate")),
        items=items,
        total=_amount(record.get("total")),
        currency=str((record.get("currency") or {}).get("code") or "USD"),
        estimated_delivery=str(delivery) if delivery else None,
    )


def _parsed_date(value: Any) -> datetime:
    if isinstance(value, datetime):
        return value
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        logger.warning("unparsable order date %r", value)
        return datetime.fromtimestamp(0)
