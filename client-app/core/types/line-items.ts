import type {
  AvailabilityData,
  CommonVendor,
  LineItemType,
  MoneyType,
  OrderLineItemType,
  Property,
  QuoteItemType,
} from "@/core/api/graphql/types";
import type { RouteLocationRaw } from "vue-router";

export type AnyLineItemType = LineItemType | OrderLineItemType | QuoteItemType;

/** @deprecated Use {@link VendorGroupType} instead. */
export type LineItemsGroupByVendorType<T extends LineItemType | OrderLineItemType> = VendorGroupType<T>;

export type VendorGroupType<T extends LineItemType | OrderLineItemType> = {
  items: T[];
  vendor?: CommonVendor;
};

export type VendorGroupByVendorIdType<T extends LineItemType | OrderLineItemType> = Record<string, VendorGroupType<T>>;

/** @deprecated Use {@link PreparedLineItemType} */
export type ExtendedLineItemType<T extends AnyLineItemType> = T & {
  extended: {
    isProductExists: boolean;
    route: RouteLocationRaw;
    displayProperties: Property[];
    minQuantity?: number;
    maxQuantity?: number;
    countInCart?: number;
  };
};

export type PreparedLineItemType = {
  id: string;
  name: string;
  imageUrl?: string;
  inStockQuantity?: number;
  listPrice?: MoneyType;
  actualPrice?: MoneyType;
  extendedPrice?: MoneyType;
  quantity?: number;
  deleted?: boolean;
  route?: RouteLocationRaw;
  properties?: Property[];
  minQuantity?: number;
  maxQuantity?: number;
  availabilityData?: AvailabilityData;
  productType?: string;
  sku?: string;
  productId?: string;
  countInCart?: number;
};
