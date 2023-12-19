import { ValidationErrorObjectType } from "@/core/enums";
import type { CartType, LineItemType, OrderLineItemType, ValidationErrorType } from "@/core/api/graphql/types";
import type { ItemForAddBulkItemsToCartResultsPopupType } from "@/shared/cart";

/** @deprecated No longer used. Add to cart mutations now return ID instead. */
export function getLineItemValidationErrorsGroupedBySKU(
  errors: ValidationErrorType[] = [],
): Record<string, ValidationErrorType[]> {
  const result: Record<string, ValidationErrorType[]> = {};

  errors?.forEach((error) => {
    const sku = error.objectId!;

    result[sku] = result[sku] || [];
    result[sku].push(error);
  });

  return result;
}

export function getItemsForAddBulkItemsToCartResultsPopup(
  inputItems: OrderLineItemType[] | LineItemType[],
  cart: CartType,
): ItemForAddBulkItemsToCartResultsPopupType[] {
  return inputItems.map<ItemForAddBulkItemsToCartResultsPopupType>((item) => ({
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
