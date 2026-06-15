import type { ShortCartFragment, LineItemType, OrderLineItemType } from "@/core/api/graphql/types";
import type { ItemForAddBulkItemsToCartResultsModalType } from "@/shared/cart";

function sumQuantityByProductId(items: ShortCartFragment["items"] | undefined): Map<string, number> {
  const result = new Map<string, number>();
  for (const item of items ?? []) {
    result.set(item.productId, (result.get(item.productId) ?? 0) + item.quantity);
  }
  return result;
}

export function getItemsForAddBulkItemsToCartResultsModal(
  inputItems: OrderLineItemType[] | LineItemType[],
  cart: ShortCartFragment,
  previousCart?: ShortCartFragment,
): ItemForAddBulkItemsToCartResultsModalType[] {
  const quantityBefore = sumQuantityByProductId(previousCart?.items);
  const quantityAfter = sumQuantityByProductId(cart.items);

  return inputItems.map<ItemForAddBulkItemsToCartResultsModalType>((item) => ({
    productExists: !!item.product,
    productId: item.productId,
    name: item.name,
    sku: item.sku,
    quantity: item.quantity,
    slug: item.product?.slug,
    isAddedToCart: (quantityAfter.get(item.productId) ?? 0) > (quantityBefore.get(item.productId) ?? 0),
  }));
}
