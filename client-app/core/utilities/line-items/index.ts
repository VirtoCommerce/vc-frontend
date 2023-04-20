import { getProductRoute } from "../product";
import type {
  AnyLineItemType,
  ExtendedLineItemType,
  LineItemsGroupByVendorType,
  LineItemsGroupsByVendorType,
  PreparedLineItemType,
} from "../../types";
import type { LineItemType, OrderLineItemType, QuoteItemType } from "@/xapi/types";

export function isQuoteItemType(item: AnyLineItemType): item is QuoteItemType {
  return "proposalPrices" in item || "selectedTierPrice" in item;
}

export function getLineItemsGroupedByVendor<T extends LineItemType | OrderLineItemType>(
  items: T[]
): LineItemsGroupByVendorType<T>[] {
  // NOTE: The group without the vendor should be displayed last.
  const groupWithoutVendor: LineItemsGroupByVendorType<T> = { items: [] };
  const map: LineItemsGroupsByVendorType<T> = {};

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

export function extendLineItem<T extends AnyLineItemType>(item: T): ExtendedLineItemType<T> {
  return {
    ...item,
    extended: {
      isProductExists: !!item.product,
      route: getProductRoute(item.productId || item.product?.id || "", item.product?.slug),
      displayProperties: item.product?.properties?.slice(0, 3) || [],
      minQuantity: item.product?.minQuantity,
      maxQuantity:
        (<LineItemType>item).inStockQuantity ||
        item.product?.availabilityData?.availableQuantity ||
        item.product?.maxQuantity,
    },
  };
}

export function prepareLineItem(item: AnyLineItemType): PreparedLineItemType {
  const productType = "productType" in item ? item.productType : undefined;
  const placedPrice = "placedPrice" in item ? item.placedPrice : undefined;
  const listPrice = "listPrice" in item ? item.listPrice : placedPrice;
  const actualPrice = "salePrice" in item ? item.salePrice : undefined;
  const extendedPrice = "extendedPrice" in item ? item.extendedPrice : undefined;
  const quantity = isQuoteItemType(item) ? item.selectedTierPrice?.quantity : item.quantity;
  const inStockQuantity =
    "inStockQuantity" in item ? item.inStockQuantity : item.product?.availabilityData?.availableQuantity;

  return {
    id: item.id,
    name: item.name || "",
    imageUrl: item.imageUrl,
    productType,
    listPrice,
    actualPrice,
    extendedPrice,
    quantity,
    inStockQuantity,
    deleted: !item.product,
    route: getProductRoute(item.productId || item.product?.id || "", item.product?.slug),
    properties: item.product?.properties?.slice(0, 3) || [],
    minQuantity: item.product?.minQuantity,
    maxQuantity:
      (<LineItemType>item).inStockQuantity ||
      item.product?.availabilityData?.availableQuantity ||
      item.product?.maxQuantity,
  };
}

export function prepareLineItems(
  items: LineItemType[] | OrderLineItemType[] | QuoteItemType[]
): PreparedLineItemType[] {
  return items.map((item) => prepareLineItem(item));
}
