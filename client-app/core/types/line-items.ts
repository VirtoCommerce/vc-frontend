import { CommonVendor, LineItemType, OrderLineItemType } from "@/xapi";

export type TLineItemsGroupByVendor<T extends LineItemType | OrderLineItemType> = {
  items: T[];
  vendor?: CommonVendor;
};

export type TLineItemsGroupsByVendor<T extends LineItemType | OrderLineItemType> = Record<
  string,
  TLineItemsGroupByVendor<T>
>;
