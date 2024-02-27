import { graphqlClient } from "../../../client";
import { GetStoreDocument } from "./getStore.generated";
import type { GetStoreQuery, GetStoreQueryVariables } from "./getStore.generated";

export async function getStore(storeId: string): Promise<GetStoreQuery["store"]> {
  const { data } = await graphqlClient.query<GetStoreQuery, GetStoreQueryVariables>({
    query: GetStoreDocument,
    variables: {
      storeId,
    },
  });

  return data.store;
}
