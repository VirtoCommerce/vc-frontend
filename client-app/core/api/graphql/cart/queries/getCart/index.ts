import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import getFullCartQuery from "./getFullCartQuery.graphql";
import getShortCartQuery from "./getShortCartQuery.graphql";
import type { CartType, Query, QueryCartArgs } from "@/core/api/graphql/types";

export type GetCartOptionsType = {
  /** @default false */
  full?: boolean;
};

export async function getCart(options: GetCartOptionsType = {}): Promise<CartType> {
  const { full = false } = options;
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await graphqlClient.query<Required<Pick<Query, "cart">>, QueryCartArgs>({
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
