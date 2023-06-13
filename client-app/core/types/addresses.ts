import type { CartAddressType, MemberAddressType, OrderAddressType, QuoteAddressType } from "@/core/api/graphql/types";

export type AnyAddressType = MemberAddressType | OrderAddressType | CartAddressType | QuoteAddressType;
