import { useQuery } from "@vue/apollo-composable";
import { computed } from "vue";
import { globals } from "@/core/globals";
import { GetReturnStatusesDocument } from "@/modules/returns/api/graphql/types";

export function useGetReturnStatusesQuery() {
  return useQuery(
    GetReturnStatusesDocument,
    computed(() => ({ cultureName: globals.cultureName })),
    {
      fetchPolicy: "cache-first",
    },
  );
}
