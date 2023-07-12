import { getProductRoute } from "../product";
import { getPropertiesGroupedByName } from "../properties";
import type {
  AnyLineItemType,
  ExtendedLineItemType,
  LineItemsGroupByVendorType,
  LineItemsGroupsByVendorType,
  PreparedLineItemType,
} from "../../types";
import type { LineItemType, MoneyType, OrderLineItemType, QuoteItemType } from "@/core/api/graphql/types";

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

/** @deprecated Use `prepareLineItem` function */
export function extendLineItem<T extends AnyLineItemType>(item: T): ExtendedLineItemType<T> {
  return {
    ...item,
    extended: {
      isProductExists: !!item.product,
      route: getProductRoute(item.productId || item.product?.id || "", item.product?.slug),
      displayProperties: Object.values(getPropertiesGroupedByName(item.product?.properties ?? [])).slice(0, 3),
      minQuantity: item.product?.minQuantity,
      maxQuantity:
        (<LineItemType>item).inStockQuantity ||
        item.product?.availabilityData?.availableQuantity ||
        item.product?.maxQuantity,
    },
  };
}

function prepareItemPrices(
  item: AnyLineItemType,
  includeVat?: boolean
): {
  listPrice?: MoneyType;
  salePrice?: MoneyType;
  actualPrice?: MoneyType;
  extendedPrice?: MoneyType;
} {
  let placedPrice = "placedPrice" in item ? item.placedPrice : undefined;
  if (includeVat && "placedPriceWithTax" in item) {
    placedPrice = item.placedPriceWithTax;
  }

  let salePrice = "salePrice" in item ? item.salePrice : undefined;
  if (includeVat && "salePriceWithTax" in item) {
    salePrice = item.salePriceWithTax;
  }

  let listPrice = "listPrice" in item ? item.listPrice : placedPrice;
  if (includeVat && "listPriceWithTax" in item) {
    listPrice = item.listPriceWithTax;
  }

  let extendedPrice = "extendedPrice" in item ? item.extendedPrice : undefined;
  if (includeVat && "extendedPriceWithTax" in item) {
    extendedPrice = item.extendedPriceWithTax;
  }

  return {
    listPrice,
    salePrice: salePrice,
    actualPrice: placedPrice || salePrice,
    extendedPrice,
  };
}

export function prepareLineItem(_payload: {
  item: AnyLineItemType;
  countInCart?: number;
  includeVat?: boolean;
}): PreparedLineItemType {
  const productType = "productType" in _payload.item ? _payload.item.productType : undefined;
  const isVariation = !!_payload.item.product?.masterVariation;
  const prices = prepareItemPrices(_payload.item, _payload.includeVat);
  const quantity = isQuoteItemType(_payload.item) ? _payload.item.selectedTierPrice?.quantity : _payload.item.quantity;
  const inStockQuantity =
    "inStockQuantity" in _payload.item
      ? _payload.item.inStockQuantity
      : _payload.item.product?.availabilityData?.availableQuantity;
  const properties = Object.values(getPropertiesGroupedByName(_payload.item.product?.properties ?? []));
  const route = isVariation
    ? getProductRoute(_payload.item.product!.masterVariation!.id || "", _payload.item.product!.masterVariation!.slug)
    : getProductRoute(_payload.item.productId || _payload.item.product?.id || "", _payload.item.product?.slug);

  return {
    ...prices,
    id: _payload.item.id,
    name: _payload.item.name || "",
    imageUrl: _payload.item.imageUrl,
    availabilityData: _payload.item.product?.availabilityData,
    productType,
    sku: _payload.item.sku,
    productId: _payload.item.productId,
    quantity,
    inStockQuantity,
    route,
    deleted: !_payload.item.product,
    properties: properties.slice(0, 3),
    countInCart: _payload.countInCart,
    minQuantity: _payload.item.product?.minQuantity,
    maxQuantity:
      (<LineItemType>_payload.item).inStockQuantity ||
      _payload.item.product?.availabilityData?.availableQuantity ||
      _payload.item.product?.maxQuantity,
  };
}

export function prepareLineItems(_payload: {
  items: LineItemType[] | OrderLineItemType[] | QuoteItemType[];
  countInCart?: number;
  includeVat?: boolean;
}): PreparedLineItemType[] {
  return _payload.items.map((item) =>
    prepareLineItem({
      item,
      countInCart: _payload.countInCart,
      includeVat: _payload.includeVat,
    })
  );
}
