import { graphqlClient } from "../../../client";
import getFulfillmentCenterQuery from "./getFulfillmentCenter.graphql";
import type { FulfillmentCenterType, Query, QueryFulfillmentCenterArgs } from "@/core/api/graphql/types";

export default async function getProduct(id: string): Promise<FulfillmentCenterType | null> {
  const { data } = await graphqlClient.query<Required<Pick<Query, "fulfillmentCenter">>, QueryFulfillmentCenterArgs>({
    query: getFulfillmentCenterQuery,
    variables: {
      id,
    },
  });

  return data.fulfillmentCenter;
}
