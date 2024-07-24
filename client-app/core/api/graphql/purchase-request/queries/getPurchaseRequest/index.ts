import { useQuery } from "@vue/apollo-composable";
import { GetPurchaseRequestDocument } from "@/core/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export function useGetPurchaseRequestQuery(variables: MaybeRefOrGetter<{ id: string }>) {
  return useQuery(GetPurchaseRequestDocument, variables, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    keepPreviousResult: true,
  });
}
