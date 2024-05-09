import { ValidationErrorObjectType } from "@/core/enums";
import type { ShortCartFragment, LineItemType, OrderLineItemType, ValidationErrorType } from "@/core/api/graphql/types";
import type { ItemForAddBulkItemsToCartResultsModalType } from "@/shared/cart";

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
