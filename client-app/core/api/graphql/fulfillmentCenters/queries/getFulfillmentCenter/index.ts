import { graphqlClient } from "../../../client";
import { GetFulfillmentCenterDocument } from "./getFulfillmentCenter.generated";
import type { FulfillmentCenterType, Query, QueryFulfillmentCenterArgs } from "@/core/api/graphql/types";

export async function getFulfillmentCenter(id: string): Promise<FulfillmentCenterType | null> {
  const { data } = await graphqlClient.query<Required<Pick<Query, "fulfillmentCenter">>, QueryFulfillmentCenterArgs>({
    query: GetFulfillmentCenterDocument,
    variables: {
      id,
    },
  });

  return data.fulfillmentCenter;
}
