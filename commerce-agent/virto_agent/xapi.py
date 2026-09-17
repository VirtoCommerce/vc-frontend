"""The x-api GraphQL client and the documents this backend sends.

The documents are written here rather than reused from the theme: the theme's fragments
carry fields a storefront page needs and the agent does not, and every field in a result
reaches the model as fenced data, so the smaller document is also the smaller prompt.
Field names and argument shapes follow ``client-app/core/api/graphql`` on ``dev``.

Errors are translated at the edge. x-api answers with GraphQL error objects — a code and a
path — and the agent needs a sentence that carries the recovery, so :func:`translate_error`
maps the codes we know onto the exceptions the executor relays as conversation. The map is
deliberately short; every code added to it is one more failure the agent recovers from in
the same turn instead of reporting as an outage.
"""

from __future__ import annotations

import logging
from typing import Any

import httpx

logger = logging.getLogger(__name__)


class XapiError(RuntimeError):
    """A transport failure or an unmapped GraphQL error. The executor reports the tool as
    temporarily unavailable, which is what an unmapped error is."""


# A pooled connection the server closed while it sat idle fails on its next use, which is
# the shape of a quiet agent: minutes between turns, then a search. Keeping connections
# for less time than the platform's idle timeout makes it rare, and retrying a read makes
# it invisible. The retry is reads only — `addItem` takes no idempotency key, so a retried
# write is a second line in the cart.
_KEEPALIVE_EXPIRY_S = 20.0
_RETRIED_ON_READ = (httpx.RemoteProtocolError, httpx.ConnectError, httpx.ReadError)


def is_read(document: str) -> bool:
    return document.lstrip().startswith("query")


class XapiClient:
    """One HTTP client for the process; the bearer travels per call, never per client."""

    def __init__(self, endpoint: str, *, timeout: float = 30.0) -> None:
        self._endpoint = endpoint
        self._client = httpx.AsyncClient(
            timeout=timeout,
            limits=httpx.Limits(keepalive_expiry=_KEEPALIVE_EXPIRY_S),
        )

    async def aclose(self) -> None:
        await self._client.aclose()

    async def execute(
        self, document: str, variables: dict[str, Any], *, token: str | None = None
    ) -> dict[str, Any]:
        try:
            return await self._post(document, variables, token)
        except _RETRIED_ON_READ as dropped:
            if not is_read(document):
                raise
            logger.info("x-api connection dropped on a read (%s); retrying once", type(dropped).__name__)
            return await self._post(document, variables, token)

    async def _post(
        self, document: str, variables: dict[str, Any], token: str | None
    ) -> dict[str, Any]:
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        response = await self._client.post(
            self._endpoint,
            json={"query": document, "variables": variables},
            headers=headers,
        )
        if response.status_code in (401, 403):
            raise XapiUnauthorized(f"x-api rejected the session credential ({response.status_code})")
        response.raise_for_status()
        body = response.json()
        if errors := body.get("errors"):
            raise translate_error(errors)
        data = body.get("data")
        if data is None:
            raise XapiError("x-api returned no data")
        return data


class XapiUnauthorized(XapiError):
    """The bearer was rejected: expired, or for another store."""


def error_code(error: dict[str, Any]) -> str:
    extensions = error.get("extensions") or {}
    return str(extensions.get("code") or extensions.get("errorCode") or "")


def translate_error(errors: list[dict[str, Any]]) -> Exception:
    """The first error mapped to an exception. Unmapped codes stay :class:`XapiError`.

    TODO: the spike notes enumerate the cases worth carrying a recovery sentence —
    quantity below the line minimum, product not orderable for this organization,
    contract price missing, cart currency mismatch, coupon not applicable. Each needs its
    real code from a live failure before it is mapped; guessing a code silently disables
    the mapping.
    """
    first = errors[0] if errors else {}
    message = str(first.get("message") or "x-api returned an error")
    code = error_code(first)
    if code in _UNAUTHORIZED_CODES:
        return XapiUnauthorized(message)
    logger.warning("unmapped x-api error code %r: %s", code, message)
    return XapiError(message)


_UNAUTHORIZED_CODES = frozenset({"AUTH_NOT_AUTHENTICATED", "AUTH_NOT_AUTHORIZED", "UNAUTHORIZED"})


# -- Documents -------------------------------------------------------------------------

# The catalog's own category tree. `query` matches the category *name*, which is what the
# blueprint's `SearchFilters.category` carries ("Catalog category name." in the tool
# schema), so a name the model wrote resolves to the id the product filter needs. The
# store query supplies the catalog id that filter must be prefixed with.
GET_STORE = """
query AgentStore($storeId: String!) {
  store(storeId: $storeId) { storeId catalogId }
}
"""

CATEGORY_TREE = """
query AgentCategoryTree(
  $storeId: String!
  $userId: String
  $currencyCode: String
  $cultureName: String
  $first: Int
) {
  categories(
    storeId: $storeId
    userId: $userId
    currencyCode: $currencyCode
    cultureName: $cultureName
    first: $first
  ) {
    totalCount
    items { id name level }
  }
}
"""

SEARCH_CATEGORIES = """
query AgentSearchCategories(
  $storeId: String!
  $userId: String
  $currencyCode: String
  $cultureName: String
  $query: String
  $first: Int
) {
  categories(
    storeId: $storeId
    userId: $userId
    currencyCode: $currencyCode
    cultureName: $cultureName
    query: $query
    first: $first
  ) {
    totalCount
    items { id name level }
  }
}
"""


# `products` is the operation behind the theme's SearchProducts. `variations` is asked for
# only as a count check: a variation's own properties (which carry its option values) come
# from a second call filtered by `productfamilyid`, because this result does not carry them.
SEARCH_PRODUCTS = """
query AgentSearchProducts(
  $storeId: String!
  $userId: String!
  $currencyCode: String!
  $cultureName: String
  $query: String
  $filter: String
  $sort: String
  $first: Int
  $fuzzy: Boolean
  $fuzzyLevel: Int
  $productIds: [String]
) {
  products(
    storeId: $storeId
    userId: $userId
    currencyCode: $currencyCode
    cultureName: $cultureName
    query: $query
    filter: $filter
    sort: $sort
    first: $first
    fuzzy: $fuzzy
    fuzzyLevel: $fuzzyLevel
    productIds: $productIds
  ) {
    totalCount
    items {
      id
      code
      name
      slug
      productType
      hasVariations
      isConfigurable
      masterVariation { id }
      minQuantity
      maxQuantity
      packSize
      imgSrc
      vendor { id name }
      description(type: "QuickReview") { content }
      availabilityData { isActive isAvailable isBuyable isInStock availableQuantity }
      price {
        currency
        actual { amount }
        list { amount }
      }
      minVariationPrice { actual { amount } }
      properties { name label value propertyType valueDisplayOrder hidden }
      rating { value reviewCount }
      breadcrumbs { title typeName }
      variations { id }
    }
  }
}
"""

GET_PRODUCT = """
query AgentGetProduct(
  $storeId: String!
  $currencyCode: String!
  $cultureName: String
  $id: String!
) {
  product(storeId: $storeId, id: $id, currencyCode: $currencyCode, cultureName: $cultureName) {
    id
    code
    name
    slug
    productType
    hasVariations
    isConfigurable
    masterVariation { id }
    minQuantity
    maxQuantity
    packSize
    imgSrc
    images { url }
    vendor { id name }
    description { content }
    availabilityData { isActive isAvailable isBuyable isInStock availableQuantity }
    price {
      currency
      actual { amount }
      list { amount }
    }
    minVariationPrice { actual { amount } }
    properties { name label value propertyType valueDisplayOrder hidden }
    rating { value reviewCount }
    breadcrumbs { title typeName }
    variations { id }
  }
}
"""

GET_FULL_CART = """
query AgentGetCart(
  $storeId: String!
  $userId: String!
  $currencyCode: String!
  $cultureName: String
) {
  cart(storeId: $storeId, userId: $userId, currencyCode: $currencyCode, cultureName: $cultureName) {
    id
    currency { code }
    items {
      id
      productId
      sku
      name
      quantity
      imageUrl
      inStockQuantity
      product {
        id
        masterVariation { id }
        properties { name label value propertyType }
      }
      placedPrice { amount }
      extendedPrice { amount }
    }
    availableShippingMethods { id code optionName optionDescription price { amount } }
  }
}
"""

# Every cart mutation selects `validationErrors`. x-api refuses a write by answering 200
# with the mutation's normal payload and the reason in that list, and the entry is not on a
# later `cart` read — so a mutation that does not ask for it cannot tell a refusal from a
# write. See `cart_errors.py` for the codes and what the model is told.
ADD_ITEM = """
mutation AgentAddItem($command: InputAddItemType!) {
  addItem(command: $command) {
    id
    validationErrors { errorCode errorMessage objectId objectType }
  }
}
"""

CHANGE_ITEM_QUANTITY = """
mutation AgentChangeItemQuantity($command: InputChangeCartItemQuantityType!) {
  changeCartItemQuantity(command: $command) {
    id
    validationErrors { errorCode errorMessage objectId objectType }
  }
}
"""

REMOVE_CART_ITEMS = """
mutation AgentRemoveCartItems($command: InputRemoveItemsType!) {
  removeCartItems(command: $command) {
    id
    validationErrors { errorCode errorMessage objectId objectType }
  }
}
"""

GET_ORDERS = """
query AgentGetOrders($first: Int, $sort: String, $cultureName: String) {
  orders(first: $first, sort: $sort, cultureName: $cultureName) {
    totalCount
    items {
      id
      number
      createdDate
      status
      statusDisplayValue
      currency { code }
      total { amount }
      items {
        productId
        sku
        name
        quantity
        placedPrice { amount }
        product { id masterVariation { id } properties { name label value propertyType } }
      }
    }
  }
}
"""

GET_ORDER = """
query AgentGetOrder($id: String, $number: String, $cultureName: String) {
  order(id: $id, number: $number, cultureName: $cultureName) {
    id
    number
    createdDate
    status
    statusDisplayValue
    currency { code }
    total { amount }
    items {
      productId
      sku
      name
      quantity
      placedPrice { amount }
      product { id masterVariation { id } properties { name label value propertyType } }
    }
    shipments { deliveryDate shipmentMethodCode shipmentMethodOption }
  }
}
"""

GET_ME = """
query AgentGetMe {
  me {
    id
    memberId
    userName
    isAdministrator
    permissions
    contact {
      fullName
      organizationId
      currencyCode
      defaultLanguage
      organization { id name }
    }
    roles { name }
  }
}
"""
