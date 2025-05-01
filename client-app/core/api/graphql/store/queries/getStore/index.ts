import { GetStoreDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";
import type { GetStoreQuery, GetStoreQueryVariables } from "@/core/api/graphql/types";

export async function getStore(domain: string): Promise<GetStoreQuery["store"]> {
  const { data } = await graphqlClient.query<GetStoreQuery, GetStoreQueryVariables>({
    query: GetStoreDocument,
    variables: {
      domain,
    },
  });

  return data.store;
}
