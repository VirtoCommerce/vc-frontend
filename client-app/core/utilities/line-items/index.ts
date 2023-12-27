import { getProductRoute } from "../product";
import { getPropertiesGroupedByName } from "../properties";
import type {
  AnyLineItemType,
  ExtendedLineItemType,
  LineItemsGroupByVendorType,
  LineItemsGroupsByVendorType,
  PreparedLineItemType,
} from "../../types";
import type { LineItemType, OrderLineItemType, QuoteItemType } from "@/core/api/graphql/types";

export function isQuoteItemType(item: AnyLineItemType): item is QuoteItemType {
  return "proposalPrices" in item || "selectedTierPrice" in item;
}

export function getLineItemsGroupedByVendor<T extends LineItemType | OrderLineItemType>(
  items: T[],
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

/** @deprecated Use {@link prepareLineItem} function */
export function extendLineItem<T extends AnyLineItemType>(item: T): ExtendedLineItemType<T> {
  return {
    ...item,
    extended: {
      isProductExists: !!item.product,
      route: getProductRoute(item.productId || item.product?.id || "", item.product?.slug),
      displayProperties: Object.values(getPropertiesGroupedByName(item.product?.properties ?? [])).slice(0, 3),
      minQuantity: item.product?.minQuantity,
      maxQuantity:
        item.product?.maxQuantity ??
        (<LineItemType>item).inStockQuantity ??
        item.product?.availabilityData?.availableQuantity,
    },
  };
}

function prepareItemPrices(item: AnyLineItemType) {
  const price = "price" in item ? item.price : undefined;
  const listPrice = price ?? ("listPrice" in item ? item.listPrice : undefined);
  const salePrice = "salePrice" in item ? item.salePrice : undefined;
  const placedPrice = "placedPrice" in item ? item.placedPrice : undefined;
  const extendedPrice = "extendedPrice" in item ? item.extendedPrice : undefined;
  return {
    listPrice,
    salePrice,
    placedPrice,
    extendedPrice,
    actualPrice: placedPrice ?? salePrice ?? listPrice,
  };
}

export function prepareLineItem(item: AnyLineItemType, countInCart?: number): PreparedLineItemType {
  const { listPrice, extendedPrice, actualPrice } = prepareItemPrices(item);

  const productType = "productType" in item ? item.productType : undefined;
  const isVariation = !!item.product?.masterVariation;
  const quantity = isQuoteItemType(item) ? item.selectedTierPrice?.quantity : item.quantity;
  const inStockQuantity =
    "inStockQuantity" in item ? item.inStockQuantity : item.product?.availabilityData?.availableQuantity;
  const properties = Object.values(getPropertiesGroupedByName(item.product?.properties ?? []));
  const route = isVariation
    ? getProductRoute(item.product!.masterVariation!.id || "", item.product!.masterVariation!.slug)
    : getProductRoute(item.productId || item.product?.id || "", item.product?.slug);

  return {
    id: item.id,
    name: item.name || "",
    imageUrl: item.imageUrl,
    availabilityData: item.product?.availabilityData,
    productType,
    sku: item.sku,
    productId: item.productId,
    listPrice,
    actualPrice,
    extendedPrice,
    quantity,
    inStockQuantity,
    route,
    deleted: !item.product,
    properties: properties.slice(0, 3),
    countInCart,
    minQuantity: item.product?.minQuantity,
    maxQuantity:
      item.product?.maxQuantity ??
      (<LineItemType>item).inStockQuantity ??
      item.product?.availabilityData?.availableQuantity,
  };
}

export function prepareLineItems(
  items: LineItemType[] | OrderLineItemType[] | QuoteItemType[],
): PreparedLineItemType[] {
  return items.map((item) => prepareLineItem(item));
}
