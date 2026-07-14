import { useQuery } from "@vue/apollo-composable";
import { computed } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepCustomersCountDocument } from "../api/graphql/types";

// Count-only query (first: 0, totalCount) for the left-rail badge — deliberately unfiltered so it
// reflects the rep's full total, not the My Customers page's filtered/paged view.
export function useSalesRepCustomersCount() {
  const { result, onError } = useQuery(SalesRepCustomersCountDocument, () => ({ storeId: globals.storeId }), {
    fetchPolicy: "cache-first",
  });

  onError((error) => {
    // Keep the nav functional (badge just hides); no toasts by design.
    Logger.error("[sales-rep] salesRepCustomers count failed:", error);
  });

  const count = computed(() => result.value?.salesRepCustomers?.totalCount ?? 0);

  return { count };
}
