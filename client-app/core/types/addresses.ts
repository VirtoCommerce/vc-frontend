import type { CartAddressType, MemberAddressType, OrderAddressType, QuoteAddressType } from "@/xapi/types";

export enum AddressType {
  Undefined = 0,
  Billing = 1,
  Shipping = 2,
  BillingAndShipping = Billing | Shipping,
}

export type AnyAddressType = (MemberAddressType | OrderAddressType | CartAddressType | QuoteAddressType) & {
  description?: string;
};
