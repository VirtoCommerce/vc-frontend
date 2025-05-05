import { graphqlClient } from "@/core/api/graphql/client";
import { globals } from "@/core/globals";
import pricesSumQueryDocument from "./pricesSumQuery.graphql";
import type { PricesSumQuery, PricesSumQueryVariables } from "@/core/api/graphql/types";
import type { ApolloQueryResult } from "@apollo/client/core";

export async function getPricesSum(lineItemIds: string[], cartId: string): Promise<PricesSumQuery["pricesSum"]> {
  const { storeId, currencyCode, cultureName, userId } = globals;
  const result: ApolloQueryResult<PricesSumQuery> = await graphqlClient.query<PricesSumQuery, PricesSumQueryVariables>({
    query: pricesSumQueryDocument,
    variables: {
      cartId,
      storeId,
      currencyCode,
      cultureName,
      userId,
      lineItemIds,
    },
  });

  return result.data.pricesSum;
}
