import { ValidationErrorObjectType } from "@/core/enums";
import type { ShortCartFragment, LineItemType, OrderLineItemType } from "@/core/api/graphql/types";
import type { ItemForAddBulkItemsToCartResultsModalType } from "@/shared/cart";

export function getItemsForAddBulkItemsToCartResultsModal(
  inputItems: OrderLineItemType[] | LineItemType[],
  cart: ShortCartFragment,
): ItemForAddBulkItemsToCartResultsModalType[] {
  return inputItems.map<ItemForAddBulkItemsToCartResultsModalType>((item) => ({
    productExists: !!item.product,
    productId: item.productId,
    name: item.name,
    sku: item.sku,
    quantity: item.quantity,
    slug: item.product?.slug,
    isAddedToCart: !cart.validationErrors.some(
      (error) => error.objectType == ValidationErrorObjectType.CatalogProduct && error.objectId === item.productId,
    ),
  }));
}
