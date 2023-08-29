import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import getFulfillmentCentersQuery from "./getFulfillmentCenters.graphql";
import type { FulfillmentCenterConnection, Query, QueryFulfillmentCentersArgs } from "@/core/api/graphql/types";

export async function getFulfillmentCenters(sort = "name"): Promise<FulfillmentCenterConnection> {
  const { storeId } = globals;

  const { data } = await graphqlClient.query<Required<Pick<Query, "fulfillmentCenters">>, QueryFulfillmentCentersArgs>({
    query: getFulfillmentCentersQuery,
    variables: {
      storeId,
      sort,
    },
  });

  return data.fulfillmentCenters;
}
