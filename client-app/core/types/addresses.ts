import type { CartAddressType, MemberAddressType, OrderAddressType, QuoteAddressType } from "@/xapi/types";

export type AnyAddressType = MemberAddressType | OrderAddressType | CartAddressType | QuoteAddressType;
