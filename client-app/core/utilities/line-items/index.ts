import { TLineItemsGroupsByVendor, TLineItemsGroupByVendor } from "@/core";
import { LineItemType, OrderLineItemType } from "@/xapi";

export function getLineItemsGroupedByVendor<T extends LineItemType | OrderLineItemType>(
  items: T[]
): TLineItemsGroupByVendor<T>[] {
  // NOTE: The group without the vendor should be displayed last.
  const groupWithoutVendor: TLineItemsGroupByVendor<T> = { items: [] };
  const map: TLineItemsGroupsByVendor<T> = {};

  items.forEach((item) => {
    const vendor = item.vendor;

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
