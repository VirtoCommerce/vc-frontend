import type { ItemForAddBulkItemsToCartResultsPopupType, OutputBulkItemType } from "@/shared/cart";
import type { OrderLineItemType, ValidationErrorType } from "@/xapi/types";

export function getLineItemValidationErrorsGroupedBySKU(
  errors: ValidationErrorType[] = []
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
  inputItems: OrderLineItemType[],
  resultItems: OutputBulkItemType[]
): ItemForAddBulkItemsToCartResultsPopupType[] {
  const errorsGroupedBySKU: Record<string, ValidationErrorType[] | undefined> = {};

  resultItems.forEach((item) => {
    errorsGroupedBySKU[item.productSku] = item.errors;
  });

  return inputItems.map<ItemForAddBulkItemsToCartResultsPopupType>((item) => ({
    productId: item.productId!,
    name: item.name!,
    sku: item.sku!,
    quantity: item.quantity!,
    slug: item.product?.slug,
    errors: errorsGroupedBySKU[item.sku!],
  }));
}
