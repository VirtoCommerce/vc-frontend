import { CartAddressType, MemberAddressType, OrderAddressType } from "@core/api/graphql/types";
import { LocationQueryValue } from "vue-router";

export type Dictionary = { [key: string | symbol | number]: any };

export enum AddressType {
  Billing = 1,
  Shipping = 2,
  BillingAndShipping = 3,
}

export type AnyAddressType = MemberAddressType | OrderAddressType | CartAddressType;

export type UseRouteQueryParamOptions<T = LocationQueryValue | LocationQueryValue[]> = {
  defaultValue?: T | null;
  validator?(queryValue: any): boolean;
  // @default push
  updateMethod?: "push" | "replace";
  // @default false
  removeFalsyValues?: boolean;
  // @default true
  removeNullishValues?: boolean;
  // @default false
  removeDefaultValues?: boolean;
};
