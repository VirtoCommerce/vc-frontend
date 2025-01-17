import { getProductRoute } from "../product";
import { getPropertiesGroupedByName } from "../properties";
import type { AnyLineItemType, VendorGroupType, VendorGroupByVendorIdType, PreparedLineItemType } from "../../types";
import type { LineItemType, OrderLineItemType, Product } from "@/core/api/graphql/types";

export function groupByVendor<T extends LineItemType | OrderLineItemType>(items: T[]): VendorGroupType<T>[] {
  // NOTE: The group without the vendor should be displayed last.
  const groupWithoutVendor: VendorGroupType<T> = { items: [] };
  const map: VendorGroupByVendorIdType<T> = {};

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

function prepareItemPrices(item: AnyLineItemType) {
  const price = "price" in item ? item.price : undefined;
  const listPrice = price ?? ("listPrice" in item ? item.listPrice : undefined);
  const salePrice = "salePrice" in item ? item.salePrice : undefined;
  const placedPrice = "placedPrice" in item ? item.placedPrice : undefined;
  const extendedPrice = "extendedPrice" in item ? item.extendedPrice : undefined;
  const listTotal = "listTotal" in item ? item.listTotal : undefined;
  return {
    listPrice,
    salePrice,
    placedPrice,
    extendedPrice,
    actualPrice: placedPrice ?? salePrice ?? listPrice,
    listTotal,
  };
}

export function prepareLineItem(item: AnyLineItemType, countInCart?: number): PreparedLineItemType {
  const { listPrice, extendedPrice, actualPrice, listTotal } = prepareItemPrices(item);

  const productType = "productType" in item ? item.productType : undefined;
  const isVariation = !!item.product?.masterVariation;
  const quantity = item.selectedTierPrice?.quantity ?? item.quantity;
  const inStockQuantity =
    "inStockQuantity" in item ? item.inStockQuantity : item.product?.availabilityData?.availableQuantity;
  const properties = Object.values(getPropertiesGroupedByName(item.product?.properties ?? []));
  const route = isVariation
    ? getProductRoute(item.product?.masterVariation?.id || "", item.product?.masterVariation?.slug)
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
    listTotal,
    quantity,
    inStockQuantity,
    route,
    deleted: !item.product,
    properties: properties.slice(0, 3),
    countInCart,
    minQuantity: item.product?.minQuantity,
    maxQuantity: item.product?.maxQuantity ?? item.inStockQuantity ?? item.product?.availabilityData?.availableQuantity,
    packSize: item.product?.packSize,
    isConfigurable: item.product?.isConfigurable,
    hasVariations: item.product?.hasVariations,
    variations: item.product?.variations,
    configurationItems: "configurationItems" in item ? item.configurationItems : undefined,
    showPlacedPrice: item.showPlacedPrice,
    product: item.product,
  };
}

export function prepareLineItems(items: AnyLineItemType[]): PreparedLineItemType[] {
  return items.map((item) => prepareLineItem(item));
}

export function prepareLineItemForProduct(item: Product, countInCart?: number): PreparedLineItemType {
  const tempLineItem: AnyLineItemType = {
    id: item.id,
    name: item.name,
    imageUrl: item.imgSrc,
    product: item,
    productId: item.id,
    sku: item.code,
    quantity: 0,
    inStockQuantity: item.availabilityData.availableQuantity,
    productType: item.productType,
    price: item.price.actual,
  };

  return prepareLineItem(tempLineItem, countInCart);
}
