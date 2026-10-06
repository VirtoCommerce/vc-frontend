import { useQuery } from "@vue/apollo-composable";
import { GetReturnsDocument } from "@/modules/returns/api/graphql/types";
import type { GetReturnsQueryVariables } from "@/modules/returns/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export function useGetReturnsQuery(variables: MaybeRefOrGetter<GetReturnsQueryVariables>) {
  return useQuery(GetReturnsDocument, variables, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    keepPreviousResult: true,
  });
}
