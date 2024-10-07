import { useQuery } from "@vue/apollo-composable";
import { computed, toValue } from "vue";
import { GetPurchaseRequestsDocument } from "@/core/api/graphql/types";
import { useAllGlobalVariables } from "../../../composables";
import type { GetPurchaseRequestsQueryVariables } from "@/core/api/graphql/types";
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
