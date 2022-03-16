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
  onChange?(value: T, isChanged: boolean): void | Promise<void>;
  // @default push
  updateMethod?: "push" | "replace";
  // @default true
  removeFalsyValue?: boolean;
  // @default true
  removeNullishValue?: boolean;
  // @default true
  removeDefaultValue?: boolean;
};
