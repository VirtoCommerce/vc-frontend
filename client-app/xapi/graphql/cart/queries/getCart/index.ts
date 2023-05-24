import globals from "@/core/globals";
import getFullCartQuery from "./getFullCartQuery.graphql";
import getShortCartQuery from "./getShortCartQuery.graphql";
import type { CartType, Query, QueryCartArgs } from "@/xapi/types";

export type GetCartOptionsType = {
  /** @default false */
  full?: boolean;
};

export async function getCart(options: GetCartOptionsType = {}): Promise<CartType> {
  const { full = false } = options;
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "cart">>, QueryCartArgs>({
    query: full ? getFullCartQuery : getShortCartQuery,
    variables: {
      storeId,
      userId,
      cultureName,
      currencyCode,
    },
  });

  return data.cart;
}
