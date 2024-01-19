import { graphqlClient } from "../../../client";
import getStoreDocument from "./getStore.graphql";
import type { GetStoreQuery, GetStoreQueryVariables } from "@/core/api/graphql/types";

export async function getStore(storeId: string): Promise<GetStoreQuery["store"]> {
  const { data } = await graphqlClient.query<GetStoreQuery, GetStoreQueryVariables>({
    query: getStoreDocument,
    variables: {
      storeId,
    },
  });

  return data.store;
}
