import { apolloClient } from "@/core/api/graphql/client";
import { OperationNames } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import mutationDocument from "./saveSearchQuery.graphql";
import type { InputSaveSearchQueryType } from "@/core/api/graphql/types";
import type { Optional } from "utility-types";

export async function saveSearchQuery(payload: Optional<InputSaveSearchQueryType, "storeId">) {
  const { storeId } = globals;

  const currentStoreId = payload.storeId ?? storeId;

  await apolloClient.mutate({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId: currentStoreId,
        ...payload,
      },
    },
    refetchQueries: [OperationNames.Query.GetSearchHistory],
  });
}
