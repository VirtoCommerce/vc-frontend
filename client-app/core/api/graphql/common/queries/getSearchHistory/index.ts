import { useLazyQuery } from "@vue/apollo-composable";
import { GetSearchHistoryDocument } from "@/core/api/graphql/types";
import { DEFAULT_SEARCH_HISTORY_MAX_COUNT } from "@/core/constants/search";
import { globals } from "@/core/globals";
import type { QuerySearchHistoryArgs } from "@/core/api/graphql/types";

export function useGetSearchHistoryQuery(payload?: Partial<QuerySearchHistoryArgs>) {
  const { storeId } = globals;

  return useLazyQuery(GetSearchHistoryDocument, {
    storeId: payload?.storeId ?? storeId,
    maxCount: payload?.maxCount ?? DEFAULT_SEARCH_HISTORY_MAX_COUNT,
  });
}
