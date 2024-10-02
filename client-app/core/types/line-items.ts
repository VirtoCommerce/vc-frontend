import type {
  AvailabilityData,
  CommonVendor,
  LineItemType,
  MoneyType,
  OrderLineItemType,
  Property,
} from "@/core/api/graphql/types";
import type { QuoteItemType } from "@/modules/quotes/api/graphql/types";
import type { RouteLocationRaw } from "vue-router";

export type AnyLineItemType = LineItemType | OrderLineItemType | QuoteItemType;

export type VendorGroupType<T> = {
  items: T[];
  vendor?: CommonVendor;
};

export type VendorGroupByVendorIdType<T> = Record<string, VendorGroupType<T>>;

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
