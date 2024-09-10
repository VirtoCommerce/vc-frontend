import type { CartAddressType, InputAddressType, MemberAddressType, OrderAddressType } from "@/core/api/graphql/types";
import type { QuoteAddressType } from "@/modules/quotes/api/graphql/types";

export type AnyAddressType = (
  | MemberAddressType
  | OrderAddressType
  | CartAddressType
  | QuoteAddressType
  | InputAddressType
) & { isFavorite?: boolean };
