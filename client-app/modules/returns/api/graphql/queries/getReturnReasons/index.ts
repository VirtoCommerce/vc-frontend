import { useQuery } from "@vue/apollo-composable";
import { computed } from "vue";
import { globals } from "@/core/globals";
import { GetReturnReasonsDocument } from "@/modules/returns/api/graphql/types";

export function useGetReturnReasonsQuery() {
  return useQuery(
    GetReturnReasonsDocument,
    computed(() => ({ storeId: globals.storeId, cultureName: globals.cultureName })),
    {
      fetchPolicy: "cache-first",
    },
  );
}
