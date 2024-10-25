import { useQuery } from "@vue/apollo-composable";
import { computed, toValue } from "vue";
import { useAllGlobalVariables } from "@/core/api/graphql/composables";
import { GetPurchaseRequestsDocument } from "@/modules/purchase-requests/api/graphql/types";
import type { GetPurchaseRequestsQueryVariables } from "@/modules/purchase-requests/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export function useGetPurchaseRequestsQuery(
  variables: MaybeRefOrGetter<Omit<GetPurchaseRequestsQueryVariables, "storeId" | "customerId">>,
) {
  return useQuery(
    GetPurchaseRequestsDocument,
    computed(() => {
      const { storeId, userId } = toValue(useAllGlobalVariables());
      return {
        storeId,
        customerId: userId,
        ...toValue(variables),
      };
    }),
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      keepPreviousResult: true,
    },
  );
}
