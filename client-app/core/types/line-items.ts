import { RouteLocationRaw } from "vue-router";
import { CommonVendor, LineItemType, OrderLineItemType, Property, QuoteItemType } from "@/xapi";

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
