import { LineItemType, OrderLineItemType, ValidationErrorType } from "@/xapi";
import { ItemForAddBulkItemsToCartResultsPopup, OutputBulkItemType, TGroupedItems, TGroupItem } from "@/shared/cart";

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
  const errorsGroupedBySKU: Record<string, ValidationErrorType[] | undefined> = {};

  resultItems.forEach((item) => {
    errorsGroupedBySKU[item.productSku] = item.errors;
  });

  return inputItems.map<ItemForAddBulkItemsToCartResultsPopup>((item) => ({
    productId: item.productId!,
    name: item.name!,
    sku: item.sku!,
    quantity: item.quantity!,
    slug: item.product?.slug,
    errors: errorsGroupedBySKU[item.sku!],
  }));
}

export function getLineItemsGroupedByVendor(items: LineItemType[]): TGroupItem[] {
  // NOTE: The group without the vendor should be displayed last.
  const groupWithoutVendor: TGroupItem = { items: [] };
  const map: TGroupedItems = {};

  items.forEach((item) => {
    const vendor = item.product?.vendor;

    if (vendor) {
      const vendorId = vendor.id;

      map[vendorId] = map[vendorId] || { vendor, items: [] };
      map[vendorId].items.push(item);
    } else {
      groupWithoutVendor.items.push(item);
    }
  });

  const result = Object.values(map)
    // Sort by Vendor
    .sort((a, b) => a.vendor!.name.localeCompare(b.vendor!.name));

  // Add the group without the vendor to the end.
  result.push(groupWithoutVendor);

  return result;
}
