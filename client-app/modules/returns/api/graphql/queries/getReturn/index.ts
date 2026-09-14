import { useQuery } from "@vue/apollo-composable";
import { GetReturnDocument } from "@/modules/returns/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export function useGetReturnQuery(variables: MaybeRefOrGetter<{ id: string }>) {
  return useQuery(GetReturnDocument, variables, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    keepPreviousResult: true,
  });
}
