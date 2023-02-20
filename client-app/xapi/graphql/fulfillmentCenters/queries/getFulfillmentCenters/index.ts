import globals from "@/core/globals";
import { FulfillmentCenterConnection, Query, QueryFulfillmentCentersArgs } from "@/xapi/types";
import fillmentCentersQueryDocument from "./getFulfillmentCenters.graphql";

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
