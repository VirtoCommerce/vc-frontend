import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import getProductConfigurationsQueryDocument from "./getProductConfigurationsQuery.graphql";
import type { GetProductConfigurationsQuery, GetProductConfigurationsQueryVariables } from "@/core/api/graphql/types";
import type { ApolloQueryResult } from "@apollo/client/core";

export async function getProductConfiguration(
  configurableProductId: string,
): Promise<GetProductConfigurationsQuery["productConfiguration"] | undefined> {
  const { storeId, cultureName, currencyCode } = globals;

  const result: ApolloQueryResult<GetProductConfigurationsQuery> = await graphqlClient.query<
    GetProductConfigurationsQuery,
    GetProductConfigurationsQueryVariables
  >({
    query: getProductConfigurationsQueryDocument,
    variables: {
      storeId,
      cultureName,
      currencyCode,
      configurableProductId,
    },
  });

  return result.data?.productConfiguration;
}
