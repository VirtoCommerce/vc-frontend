import { useQuery } from "@vue/apollo-composable";
import { computed } from "vue";
import { globals } from "@/core/globals";
import { SalesRepCustomersCountDocument } from "../api/graphql/types";

// Count-only query (first: 0, totalCount) for the left-rail badge — deliberately unfiltered so it
// reflects the rep's full total, not the My Customers page's filtered/paged view.
export function useSalesRepCustomersCount() {
  const { result } = useQuery(SalesRepCustomersCountDocument, () => ({ storeId: globals.storeId }), {
    fetchPolicy: "cache-first",
  });

  const count = computed(() => result.value?.salesRepCustomers?.totalCount ?? 0);

  return { count };
}
