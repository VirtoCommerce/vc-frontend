import { useCartQueryVariables } from "@/core/api/graphql/cart/composables";
import { useLazyQuery } from "@/core/api/graphql/composables";
import { GetFullCartDocument } from "@/core/api/graphql/types";

export function useGetFullCartQuery() {
  return useLazyQuery(GetFullCartDocument, useCartQueryVariables(), {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    keepPreviousResult: true,
  });
}
