import { CartAddressType, MemberAddressType, OrderAddressType, QuoteAddressType } from "@/xapi/types";

export enum AddressType {
  Billing = 1,
  Shipping = 2,
  BillingAndShipping = 3,
}

export type AnyAddressType = MemberAddressType | OrderAddressType | CartAddressType | QuoteAddressType;
