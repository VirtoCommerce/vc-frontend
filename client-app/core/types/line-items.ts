import type { CommonVendor, LineItemType, OrderLineItemType, Property, QuoteItemType } from "@/xapi/types";
import type { RouteLocationRaw } from "vue-router";

export type LineItemsGroupByVendorType<T extends LineItemType | OrderLineItemType> = {
  items: T[];
  vendor?: CommonVendor;
};

export type LineItemsGroupsByVendorType<T extends LineItemType | OrderLineItemType> = Record<
  string,
  LineItemsGroupByVendorType<T>
>;

export type ExtendedLineItemType<T extends LineItemType | OrderLineItemType | QuoteItemType> = T & {
  extended: {
    isProductExists: boolean;
    route: RouteLocationRaw;
    displayProperties: Property[];
    minQuantity?: number;
    maxQuantity?: number;
  };
};
