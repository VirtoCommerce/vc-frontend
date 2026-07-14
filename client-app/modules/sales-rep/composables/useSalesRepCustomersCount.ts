import { useQuery } from "@vue/apollo-composable";
import { computed } from "vue";
import { globals } from "@/core/globals";
import { SalesRepCustomersDocument } from "../api/graphql/types";

// Total number of customers the current rep serves — deliberately unfiltered (empty keyword,
// first: 1) so the left-rail badge reflects the full total, not the page's filtered/paged view.
export function useSalesRepCustomersCount() {
  const { result } = useQuery(
    SalesRepCustomersDocument,
    () => ({ storeId: globals.storeId, first: 1, after: "0", keyword: "", sort: "name:asc" }),
    { fetchPolicy: "cache-first" },
  );

  const count = computed(() => result.value?.salesRepCustomers?.totalCount ?? 0);

  return { count };
}
