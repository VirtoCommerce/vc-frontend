import { LineItemType, OrderLineItemType, Vendor } from "@/xapi";

export type TLineItemsGroupByVendor<T extends LineItemType | OrderLineItemType> = {
  items: T[];
  vendor?: Vendor;
};

export type TLineItemsGroupsByVendor<T extends LineItemType | OrderLineItemType> = Record<
  string,
  TLineItemsGroupByVendor<T>
>;
