import { useLazyQuery } from "@vue/apollo-composable";
import { GetSearchHistoryDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import type { QuerySearchHistoryArgs } from "@/core/api/graphql/types";

const DEFAULT_MAX_COUNT = 10;

export function useGetSearchHistoryQuery(payload?: Partial<QuerySearchHistoryArgs>) {
  const { storeId } = globals;

  return useLazyQuery(GetSearchHistoryDocument, {
    storeId: payload?.storeId ?? storeId,
    maxCount: payload?.maxCount ?? DEFAULT_MAX_COUNT,
  });
}
