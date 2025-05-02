import { GetStoreDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";

export async function getStore(domain: string) {
  const { data } = await graphqlClient.query({
    query: GetStoreDocument,
    variables: {
      domain,
    },
  });

  return data.store;
}
