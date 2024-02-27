import { useLazyQuery } from "@vue/apollo-composable";
import { useCartQueryVariables } from "@/core/api/graphql/cart/composables";
import { GetFullCartDocument } from "./getFullCartQuery.generated";

export function useGetFullCartQuery() {
  return useLazyQuery(GetFullCartDocument, useCartQueryVariables(), {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    keepPreviousResult: true,
  });
}
