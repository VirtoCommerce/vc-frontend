import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import getCartPickupLocationsQueryDocument from "./getCartPickupLocationsQuery.graphql";
import type { Query, QueryCartPickupLocationsArgs, CartPickupLocationConnection } from "@/core/api/graphql/types";

export async function getCartPickupLocations(
  payload: Omit<QueryCartPickupLocationsArgs, "storeId" | "cultureName">,
): Promise<CartPickupLocationConnection> {
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
