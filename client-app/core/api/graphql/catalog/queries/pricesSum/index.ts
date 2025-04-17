import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import pricesSumQueryDocument from "./pricesSumQuery.graphql";
import type { PricesSumQuery, PricesSumQueryVariables } from "@/core/api/graphql/types";

export async function getPricesSum(lineItemIds: string[], cartId: string) {
  const { storeId, cultureName, currencyCode, userId } = globals;

  const { data } = await graphqlClient.query<PricesSumQuery, PricesSumQueryVariables>({
    query: pricesSumQueryDocument,
    variables: {
      cartId,
      storeId,
      cultureName,
      currencyCode,
      userId,
      lineItemIds,
    },
  });

  return data.pricesSum;
}
