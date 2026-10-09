import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import getProductPickupLocationsQueryDocument from "./getProductPickupLocationsQuery.graphql";
import type { Query, QueryProductPickupLocationsArgs, ProductPickupLocationConnection } from "@/core/api/graphql/types";

export async function getProductPickupLocations(
  payload: Omit<QueryProductPickupLocationsArgs, "storeId" | "cultureName">,
): Promise<ProductPickupLocationConnection> {
  const { storeId, cultureName } = globals;

  const { data } = await graphqlClient.query<
    Required<Pick<Query, "productPickupLocations">>,
    QueryProductPickupLocationsArgs
  >({
    query: getProductPickupLocationsQueryDocument,
    variables: {
      storeId,
      cultureName,
      ...payload,
    },
  });

  return data.productPickupLocations;
}
