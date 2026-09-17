"""How a search reaches x-api: the plural retry, and the category the model named."""

from __future__ import annotations

from typing import Any

import pytest
from shopping_agent import NotOffered, SearchFilters

from virto_agent.backend import UnknownCategory, VirtoStorefrontBackend
from virto_agent.context import VirtoSessionContext
from virto_agent.settings import Settings

SETTINGS = Settings(
    xapi_endpoint="https://example.invalid/graphql",
    store_id="B2B-store",
    currency_code="USD",
    culture_name="en-US",
    request_timeout_s=5,
)


class RecordingClient:
    """Answers each product search from a scripted list and keeps what it was sent.

    The store and category lookups answer from fixed data - the tree read and the name
    search from the same list - so a test can assert on the search calls alone;
    ``searches`` holds those and ``documents`` the whole order.
    """

    def __init__(
        self,
        pages: list[list[dict[str, Any]]],
        categories: list[dict[str, Any]] | None = None,
        catalog_id: str | None = "cat-1",
    ) -> None:
        self.pages = pages
        self.categories = categories if categories is not None else [
            {"id": "c-soft", "name": "Soft Drinks", "level": 1}
        ]
        self.catalog_id = catalog_id
        self.searches: list[dict[str, Any]] = []
        self.documents: list[str] = []

    async def execute(self, document: str, variables: dict[str, Any], *, token=None) -> dict:
        name = document.split("(")[0].split()[-1]
        self.documents.append(name)
        if name == "AgentStore":
            return {"store": {"storeId": "B2B-store", "catalogId": self.catalog_id}}
        if name in ("AgentSearchCategories", "AgentCategoryTree"):
            return {"categories": {"items": list(self.categories), "totalCount": len(self.categories)}}
        self.searches.append(variables)
        items = self.pages.pop(0) if self.pages else []
        return {"products": {"items": items, "totalCount": len(items)}}


def product(product_id: str) -> dict[str, Any]:
    return {
        "id": product_id,
        "name": product_id,
        "price": {"currency": "USD", "actual": {"amount": 1.0}},
        "availabilityData": {
            "isActive": True,
            "isAvailable": True,
            "isBuyable": True,
            "isInStock": True,
        },
    }


def backend_over(
    pages: list[list[dict[str, Any]]], **client_kwargs: Any
) -> tuple[VirtoStorefrontBackend, RecordingClient]:
    client = RecordingClient(pages, **client_kwargs)
    return VirtoStorefrontBackend(client=client, settings=SETTINGS), client


SESSION = VirtoSessionContext(session_id="s", user_id="u", access_token="t")


async def test_an_empty_first_pass_retries_at_fuzzy_level_one() -> None:
    backend, client = backend_over([[], [product("P-1")]])

    found = await backend.search_products(SESSION, "carriage bolts")

    assert [p.product_id for p in found] == ["P-1"]
    assert [call["fuzzyLevel"] for call in client.searches] == [None, 1]


async def test_a_first_pass_with_hits_is_not_retried() -> None:
    backend, client = backend_over([[product("P-1")]])

    await backend.search_products(SESSION, "carriage bolt")

    assert len(client.searches) == 1


async def test_a_named_category_becomes_a_subtree_filter_and_leaves_the_query_alone() -> None:
    """The index does not match category names, so "soft drinks" as text finds nothing
    while the catalog's own tree finds the seventeen products in that category."""
    backend, client = backend_over([[product("P-1")]])

    await backend.search_products(SESSION, "cans", SearchFilters(category="soft drinks"))

    assert client.searches[0]["query"] == "cans"
    assert client.searches[0]["filter"] == 'category.subtree:"cat-1/c-soft"'


async def test_a_name_used_twice_searches_both_categories() -> None:
    """This catalog files *Juice* at level 1 holding nothing and at level 2 holding two."""
    backend, client = backend_over(
        [[product("P-1")]],
        categories=[
            {"id": "c-deep", "name": "Soft Drinks", "level": 2},
            {"id": "c-root", "name": "Soft Drinks", "level": 1},
        ],
    )

    await backend.search_products(SESSION, "", SearchFilters(category="Soft Drinks"))

    assert client.searches[0]["filter"] == 'category.subtree:"cat-1/c-deep","cat-1/c-root"'


async def test_a_name_the_catalog_has_no_category_for_is_reported_not_dropped() -> None:
    """Dropping it would have the model believe it searched an aisle it never searched."""
    backend, client = backend_over(
        [[product("P-1")]],
        categories=[{"id": "c-fix", "name": "Fixings", "level": 1}],
    )

    with pytest.raises(UnknownCategory) as raised:
        await backend.search_products(SESSION, "bolt", SearchFilters(category="fasteners"))

    assert raised.value.name == "fasteners"
    assert raised.value.candidates == ["Fixings"]
    assert raised.value.top_level == ["Fixings"]
    assert client.searches == []


async def test_a_near_miss_is_not_taken_for_the_name_asked_for() -> None:
    """``categories("bolts")`` answers with *Flange Bolts* here: a different aisle."""
    backend, _ = backend_over(
        [[product("P-1")]],
        categories=[{"id": "c-flange", "name": "Flange Bolts", "level": 2}],
    )

    with pytest.raises(UnknownCategory):
        await backend.search_products(SESSION, "", SearchFilters(category="bolts"))


async def test_a_search_with_nothing_to_search_for_is_refused() -> None:
    """Otherwise x-api answers with the catalog's first page, which reads as an answer."""
    backend, client = backend_over([[product("P-1")]])

    with pytest.raises(NotOffered):
        await backend.search_products(SESSION, "", SearchFilters())

    assert client.searches == []


async def test_the_catalog_and_a_resolved_name_are_each_read_once() -> None:
    backend, client = backend_over([[product("P-1")], [product("P-2")]])

    await backend.search_products(SESSION, "cans", SearchFilters(category="soft drinks"))
    await backend.search_products(SESSION, "bottles", SearchFilters(category="Soft Drinks"))

    assert client.documents.count("AgentStore") == 1
    assert client.documents.count("AgentSearchCategories") == 1


async def test_price_and_attribute_filters_become_one_expression() -> None:
    backend, client = backend_over([[product("P-1")]])

    await backend.search_products(
        SESSION, "bolt", SearchFilters(min_price=10, max_price=50, attributes={"Finish": "Plain"})
    )

    assert client.searches[0]["filter"] == 'price.usd:(10 TO 50) "Finish":"Plain"'


async def test_a_narrowing_that_empties_the_category_falls_back_to_the_category() -> None:
    """The category is the aisle the customer named; the text was our narrowing of it."""
    backend, client = backend_over([[], [product("P-1"), product("P-2")]])

    found = await backend.search_products(SESSION, "cola", SearchFilters(category="soft drinks"))

    assert [p.product_id for p in found] == ["P-1", "P-2"]
    assert [call["query"] for call in client.searches] == ["cola", None]
    assert all(call["filter"] == 'category.subtree:"cat-1/c-soft"' for call in client.searches)


async def test_a_category_that_resolves_and_stays_empty_still_retries_on_fuzzy() -> None:
    backend, client = backend_over([[], [], [product("P-1")]])

    await backend.search_products(SESSION, "carriage bolts", SearchFilters(category="soft drinks"))

    assert [call["fuzzyLevel"] for call in client.searches] == [None, None, 1]
