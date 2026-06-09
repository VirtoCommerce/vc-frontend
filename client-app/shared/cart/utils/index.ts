import type { ShortCartFragment, LineItemType, OrderLineItemType } from "@/core/api/graphql/types";
import type { ItemForAddBulkItemsToCartResultsModalType } from "@/shared/cart";

export function getItemsForAddBulkItemsToCartResultsModal(
  inputItems: OrderLineItemType[] | LineItemType[],
  cart: ShortCartFragment,
): ItemForAddBulkItemsToCartResultsModalType[] {
  // An item counts as added only if it actually ended up in the resulting cart.
  // Relying on the cart contents (instead of validation errors) also catches lines the
  // server silently drops, e.g. configurable products sent without their configuration.
  const cartProductIds = new Set((cart.items ?? []).map((item) => item.productId));

  return inputItems.map<ItemForAddBulkItemsToCartResultsModalType>((item) => ({
    productExists: !!item.product,
    productId: item.productId,
    name: item.name,
    sku: item.sku,
    quantity: item.quantity,
    slug: item.product?.slug,
    isAddedToCart: cartProductIds.has(item.productId),
  }));
}
