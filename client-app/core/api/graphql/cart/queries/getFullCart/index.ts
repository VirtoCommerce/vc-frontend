import { useLazyQuery } from "@vue/apollo-composable";
import { useAllGlobalVariables } from "@/core/api/graphql/composables";
import { GetFullCartDocument } from "@/core/api/graphql/types";

export function useGetFullCartQuery() {
  return useLazyQuery(GetFullCartDocument, useAllGlobalVariables(), {
    notifyOnNetworkStatusChange: true,
  });
}
