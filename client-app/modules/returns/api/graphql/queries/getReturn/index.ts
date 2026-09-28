import { useQuery } from "@vue/apollo-composable";
import { computed, toValue } from "vue";
import { globals } from "@/core/globals";
import { GetReturnDocument } from "@/modules/returns/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export function useGetReturnQuery(variables: MaybeRefOrGetter<{ id: string }>) {
  return useQuery(
    GetReturnDocument,
    computed(() => ({ ...toValue(variables), cultureName: globals.cultureName })),
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      keepPreviousResult: true,
    },
  );
}
