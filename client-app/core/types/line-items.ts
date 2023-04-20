import type { CommonVendor, LineItemType, MoneyType, OrderLineItemType, Property, QuoteItemType } from "@/xapi/types";
import type { RouteLocationRaw } from "vue-router";

export type AnyLineItemType = LineItemType | OrderLineItemType | QuoteItemType;

export type LineItemsGroupByVendorType<T extends LineItemType | OrderLineItemType> = {
  items: T[];
  vendor?: CommonVendor;
};

export type LineItemsGroupsByVendorType<T extends LineItemType | OrderLineItemType> = Record<
  string,
  LineItemsGroupByVendorType<T>
>;

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
  properties: Property[];
  minQuantity?: number;
  maxQuantity?: number;
  productType?: string;
};
