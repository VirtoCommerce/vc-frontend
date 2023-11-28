import { useLazyQuery } from "@vue/apollo-composable";
import { useCartQueryVariables } from "@/core/api/graphql/cart/composables";
import { GetShortCartDocument } from "@/core/api/graphql/types";

export function useGetShortCartQuery() {
  return useLazyQuery(GetShortCartDocument, useCartQueryVariables(), {
    notifyOnNetworkStatusChange: true,
  });
}
