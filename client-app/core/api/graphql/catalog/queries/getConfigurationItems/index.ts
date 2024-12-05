import { graphqlClient } from "@/core/api/graphql/client";
import { globals } from "@/core/globals";
import getConfigurationItemsQueryDocument from "./getConfigurationItems.graphql";
import type { GetConfigurationItemsQuery, GetConfigurationItemsQueryVariables } from "@/core/api/graphql/types";
import type { ApolloQueryResult } from "@apollo/client/core";

export async function getConfigurationItems(
  lineItemId: string,
  cartId?: string,
): Promise<GetConfigurationItemsQuery["configurationItems"] | undefined> {
  const { storeId, cultureName, currencyCode } = globals;

  const result: ApolloQueryResult<GetConfigurationItemsQuery> = await graphqlClient.query<
    GetConfigurationItemsQuery,
    GetConfigurationItemsQueryVariables
  >({
    query: getConfigurationItemsQueryDocument,
    variables: {
      storeId,
      cultureName,
      currencyCode,
      lineItemId,
      cartId,
    },
  });

  return result.data.configurationItems;
}
