import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import getCartPickupLocationsQueryDocument from "./getCartPickupLocationsQuery.graphql";
import type { Query, QueryCartPickupLocationsArgs, ProductPickupLocationConnection } from "@/core/api/graphql/types";

export async function getCartPickupLocations(
  payload: Omit<QueryCartPickupLocationsArgs, "storeId" | "cultureName">,
): Promise<ProductPickupLocationConnection> {
  const { storeId, cultureName } = globals;

  const { data } = await graphqlClient.query<
    Required<Pick<Query, "cartPickupLocations">>,
    QueryCartPickupLocationsArgs
  >({
    query: getCartPickupLocationsQueryDocument,
    variables: {
      storeId,
      cultureName,
      ...payload,
    },
  });

  return data.cartPickupLocations;
}
