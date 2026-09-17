"""A backend that answers without a platform, for tests that are about the agent."""

from __future__ import annotations

from typing import Any

from shopping_agent import (
    Cart,
    FulfillmentOption,
    Order,
    Policy,
    Product,
    ProductDetails,
    SearchFilters,
    ShoppingSessionContext,
    StorefrontBackend,
    UserPreferences,
)


class StubBackend(StorefrontBackend):
    """Empty but well-formed. Every method returns the shape its contract promises, so a
    test exercises the agent rather than a mock's opinions."""

    def __init__(self, products: list[ProductDetails] | None = None) -> None:
        self.products = {product.product_id: product for product in products or []}
        self.cart = Cart()

    async def search_products(
        self,
        session: ShoppingSessionContext,
        query: str,
        filters: SearchFilters | None = None,
        limit: int = 8,
    ) -> list[Product]:
        return list(self.products.values())[:limit]

    async def get_product_details(
        self, session: ShoppingSessionContext, product_id: str
    ) -> ProductDetails | None:
        return self.products.get(product_id)

    async def get_cart(self, session: ShoppingSessionContext) -> Cart:
        return self.cart

    async def add_to_cart(
        self, session: ShoppingSessionContext, product_id: str, quantity: int
    ) -> Cart:
        return self.cart

    async def update_cart_item(
        self, session: ShoppingSessionContext, product_id: str, quantity: int
    ) -> Cart:
        return self.cart

    async def remove_from_cart(self, session: ShoppingSessionContext, product_id: str) -> Cart:
        return self.cart

    async def get_preferences(self, session: ShoppingSessionContext) -> UserPreferences:
        return UserPreferences(user_id=session.user_id)

    async def get_account_context(self, session: ShoppingSessionContext) -> dict[str, Any] | None:
        return None

    async def get_orders(self, session: ShoppingSessionContext, limit: int = 5) -> list[Order]:
        return []

    async def get_order(self, session: ShoppingSessionContext, order_id: str) -> Order | None:
        return None

    async def search_policies(self, session: ShoppingSessionContext, query: str) -> list[Policy]:
        return []

    async def get_fulfillment_options(
        self, session: ShoppingSessionContext, product_ids: list[str]
    ) -> list[FulfillmentOption]:
        return []
