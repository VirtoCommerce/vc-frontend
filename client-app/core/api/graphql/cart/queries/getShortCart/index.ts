import { useLazyQuery } from "@vue/apollo-composable";
import { useAllGlobalVariables } from "@/core/api/graphql/composables";
import { GetShortCartDocument } from "@/core/api/graphql/types";

export function useGetShortCartQuery() {
  return useLazyQuery(GetShortCartDocument, useAllGlobalVariables(), {
    notifyOnNetworkStatusChange: true,
  });
}
