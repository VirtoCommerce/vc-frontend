import { useQuery } from "@vue/apollo-composable";
import { useCartQueryVariables } from "@/core/api/graphql/cart/composables";
import { GetShortCartDocument } from "./getShortCartQuery.generated";

export function useGetShortCartQuery() {
  return useQuery(GetShortCartDocument, useCartQueryVariables(), {
    notifyOnNetworkStatusChange: true,
  });
}
