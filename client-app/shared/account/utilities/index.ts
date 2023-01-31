import { getProductRoute } from "@/core";
import { OrderLineItemType, QuoteItemType } from "@/xapi";
import { TGroupedItems, TGroupItem } from "../types";

export function extendQuoteItem(item: QuoteItemType) {
  return {
    ...item,
    extended: {
      isProductExists: !!item.product,
      route: getProductRoute(item.product?.id ?? "", item.product?.slug),
      displayProperties: item.product?.properties?.slice(0, 3) || [],
    },
  };
}

export function extendOrderItem(item: OrderLineItemType) {
  return {
    ...item,
    extended: {
      isProductExists: !!item.product,
      route: getProductRoute(item.productId, item.product?.slug),
      displayProperties: item.product?.properties?.slice(0, 3),
    },
  };
}

export function getItemsGroupedByVendor(items: OrderLineItemType[]): TGroupItem[] {
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
