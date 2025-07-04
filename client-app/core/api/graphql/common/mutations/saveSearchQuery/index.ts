import { graphqlClient } from "@/core/api/graphql/client";
import { globals } from "@/core/globals";
import mutationDocument from "./saveSearchQuery.graphql";
import type { InputSaveSearchQueryType } from "@/core/api/graphql/types";
import type { Optional } from "utility-types";

export async function saveSearchQuery(payload: Optional<InputSaveSearchQueryType, "storeId">) {
  const { storeId } = globals;

  await graphqlClient.mutate({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId: payload.storeId ?? storeId,
        ...payload,
      },
    },
  });
}
