import { useQuery } from "@vue/apollo-composable";
import { GetReturnableItemsDocument } from "@/modules/returns/api/graphql/types";
import type { MaybeRef, MaybeRefOrGetter } from "vue";

export function useGetReturnableItemsQuery(
  variables: MaybeRefOrGetter<{ orderId: string }>,
  enabled?: MaybeRef<boolean>,
) {
  return useQuery(GetReturnableItemsDocument, variables, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    keepPreviousResult: true,
    enabled,
  });
}
