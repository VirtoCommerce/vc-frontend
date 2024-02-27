import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import { GetFulfillmentCentersDocument } from "./getFulfillmentCenters.generated";
import type { FulfillmentCenterConnection, Query, QueryFulfillmentCentersArgs } from "@/core/api/graphql/types";

export async function getFulfillmentCenters(sort = "name"): Promise<FulfillmentCenterConnection> {
  const { storeId } = globals;

  const { data } = await graphqlClient.query<Required<Pick<Query, "fulfillmentCenters">>, QueryFulfillmentCentersArgs>({
    query: GetFulfillmentCentersDocument,
    variables: {
      storeId,
      sort,
    },
  });

  return data.fulfillmentCenters;
}
