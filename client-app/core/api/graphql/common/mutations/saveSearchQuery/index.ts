import { graphqlClient } from "@/core/api/graphql/client";
import mutationDocument from "./saveSearchQuery.graphql";
import type { InputSaveSearchQueryType } from "@/core/api/graphql/types";

export async function saveSearchQuery(payload: InputSaveSearchQueryType) {
  await graphqlClient.mutate({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });
}
