import { useQuery } from "@vue/apollo-composable";
import { computed } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepCustomersCountDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY } from "../constants";

// Count-only query (first: 0, totalCount) for the left-rail badge — deliberately unfiltered so it
// reflects the rep's full total, not the My Customers page's filtered/paged view.
export function useSalesRepCustomersCount() {
  // Revalidates like the rest of the hub: the badge shows the same number as the dashboard's
  // "Assigned customers" card, and cache-first was the one way left for the two to disagree.
  const { result, onError } = useQuery(SalesRepCustomersCountDocument, () => ({ storeId: globals.storeId }), {
    fetchPolicy: HUB_FETCH_POLICY,
  });

  onError((error) => {
    // Keep the nav functional (badge just hides); no toasts by design.
    Logger.error("[sales-rep] salesRepCustomers count failed:", error);
  });

  const count = computed(() => result.value?.salesRepCustomers?.totalCount ?? 0);

  return { count };
}
