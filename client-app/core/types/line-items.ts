import type {
  AvailabilityData,
  CommonVendor,
  MoneyType,
  Product,
  Property,
  VariationType,
} from "@/core/api/graphql/types";
import type { RouteLocationRaw } from "vue-router";

export type AnyLineItemType = {
  id: string;
  name: string;
  imageUrl?: string;
  product?: Product;
  productId?: string;
  sku?: string;
  quantity?: number;
  inStockQuantity?: number;
  productType?: string;
  price?: MoneyType;
  listPrice?: MoneyType;
  salePrice?: MoneyType;
  placedPrice?: MoneyType;
  extendedPrice?: MoneyType;
  proposalPrices?: {
    price: MoneyType;
    quantity: number;
  };
  selectedTierPrice?: {
    price: MoneyType;
    quantity: number;
  };
  isConfigurable?: boolean;
  hasVariations?: boolean;
  variations?: VariationType[];
  configurationItems?: {
    id: string;
    name?: string;
    customText?: string;
  }[];
  showPlacedPrice?: boolean;
  listTotal?: MoneyType;
};

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
  packSize?: number;
  availabilityData?: AvailabilityData;
  productType?: string;
  sku?: string;
  productId?: string;
  countInCart?: number;
  isConfigurable?: boolean;
  hasVariations?: boolean;
  variations?: VariationType[];
  configurationItems?: {
    id: string;
    name?: string;
    customText?: string;
  }[];
  showPlacedPrice?: boolean;
  listTotal?: MoneyType;
  product?: Product;
};
