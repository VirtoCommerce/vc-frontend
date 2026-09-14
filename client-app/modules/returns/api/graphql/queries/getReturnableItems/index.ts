import { useQuery } from "@vue/apollo-composable";
import { GetReturnableItemsDocument } from "@/modules/returns/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export function useGetReturnableItemsQuery(variables: MaybeRefOrGetter<{ orderId: string }>) {
  return useQuery(GetReturnableItemsDocument, variables, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    keepPreviousResult: true,
  });
}
