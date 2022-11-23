import { OrderLineItemType, ValidationErrorType } from "@/xapi";
import { ItemForAddBulkItemsToCartResultsPopup, OutputBulkItemType } from "@/shared/cart";

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
): ItemForAddBulkItemsToCartResultsPopup[] {
  const dictionaryOfErrorsGroupedBySKU: Record<string, ValidationErrorType[] | undefined> = {};

  resultItems.forEach((item) => {
    dictionaryOfErrorsGroupedBySKU[item.productSku] = item.errors;
  });

  return inputItems.map<ItemForAddBulkItemsToCartResultsPopup>((item) => ({
    productId: item.productId!,
    name: item.name!,
    sku: item.sku!,
    quantity: item.quantity!,
    slug: item.product!.slug,
    errors: dictionaryOfErrorsGroupedBySKU[item.sku!],
  }));
}
