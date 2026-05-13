import { InitializeApplicationDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";

export async function initializeApplication(domain: string) {
  const { data } = await graphqlClient.query({
    query: InitializeApplicationDocument,
    variables: {
      domain,
    },
  });

  return data.store;
}
