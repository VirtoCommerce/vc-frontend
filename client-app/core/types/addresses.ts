import type {
  CartAddressType,
  InputAddressType,
  MemberAddressType,
  OrderAddressType,
  QuoteAddressType,
} from "@/core/api/graphql/types";

export type AnyAddressType = (
  | MemberAddressType
  | OrderAddressType
  | CartAddressType
  | QuoteAddressType
  | InputAddressType
) & { isFavorite?: boolean };
