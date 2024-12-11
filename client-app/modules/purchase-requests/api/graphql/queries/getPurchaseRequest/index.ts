import { useQuery } from "@vue/apollo-composable";
import { GetPurchaseRequestDocument } from "@/modules/purchase-requests/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export function useGetPurchaseRequestQuery(variables: MaybeRefOrGetter<{ purchaseRequestId: string }>) {
  return useQuery(GetPurchaseRequestDocument, variables, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    keepPreviousResult: true,
  });
}
