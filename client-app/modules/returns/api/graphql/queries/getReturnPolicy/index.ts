import { useQuery } from "@vue/apollo-composable";
import { computed } from "vue";
import { globals } from "@/core/globals";
import { GetReturnPolicyDocument } from "@/modules/returns/api/graphql/types";

export function useGetReturnPolicyQuery() {
  return useQuery(
    GetReturnPolicyDocument,
    computed(() => ({ storeId: globals.storeId })),
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      keepPreviousResult: true,
    },
  );
}
