import fillmentCenterQueryDocument from "./getFulfillmentCenter.graphql";
import type { FulfillmentCenterType, Query, QueryFulfillmentCenterArgs } from "@/xapi/types";

export default async function getProduct(id: string): Promise<FulfillmentCenterType | null> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "fulfillmentCenter">>, QueryFulfillmentCenterArgs>({
    query: fillmentCenterQueryDocument,
    variables: {
      id,
    },
  });

  return data.fulfillmentCenter;
}
