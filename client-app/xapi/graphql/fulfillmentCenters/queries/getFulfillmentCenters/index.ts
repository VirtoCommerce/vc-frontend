import globals from "@/core/globals";
import fillmentCentersQueryDocument from "./getFulfillmentCenters.graphql";
import type { FulfillmentCenterConnection, Query, QueryFulfillmentCentersArgs } from "@/xapi/types";

export default async function getFulfillmentCenters(sort = "name"): Promise<FulfillmentCenterConnection> {
  const { storeId } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "fulfillmentCenters">>, QueryFulfillmentCentersArgs>(
    {
      query: fillmentCentersQueryDocument,
      variables: {
        storeId,
        sort,
      },
    }
  );

  return data.fulfillmentCenters;
}
