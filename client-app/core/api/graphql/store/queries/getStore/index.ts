import { GetStoreDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";
import type { GetStoreQuery } from "@/core/api/graphql/types";

export async function getStore(domain: string): Promise<GetStoreQuery["store"]> {
  const { data } = await graphqlClient.query({
    query: GetStoreDocument,
    variables: {
      domain,
    },
  });

  return data.store;
}
