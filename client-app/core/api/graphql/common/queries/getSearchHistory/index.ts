import { useLazyQuery } from "@vue/apollo-composable";
import { globals } from "@/core/globals";
import getSearchHistoryDocument from "./getSearchHistory.graphql";
import type { QuerySearchHistoryArgs } from "@/core/api/graphql/types";

export function getSearchHistory(payload?: Partial<QuerySearchHistoryArgs>) {
  const { storeId } = globals;

  return useLazyQuery(getSearchHistoryDocument, {
    variables: {
      storeId: payload?.storeId ?? storeId,
      maxCount: payload?.maxCount ?? 10,
    },
  });
}
