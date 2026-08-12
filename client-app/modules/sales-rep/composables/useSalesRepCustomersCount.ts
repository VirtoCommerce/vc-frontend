import { useQuery } from "@vue/apollo-composable";
import { createSharedComposable } from "@vueuse/core";
import { computed } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepCustomersCountDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY } from "../constants";

// Count-only query (first: 0, totalCount) for the left-rail badge — deliberately unfiltered so it
// reflects the rep's full total, not the My Customers page's filtered/paged view.
export function useSalesRepCustomersCount() {
  // Shows the same number as the dashboard's "Assigned customers" card — cache-first let the two disagree.
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

/**
 * One query for however many nav surfaces show the badge at once, stopped when the last of them
 * unmounts. The next mount builds it again, so the badge cannot keep painting a figure from
 * earlier in the session.
 */
export const useSharedSalesRepCustomersCount = createSharedComposable(useSalesRepCustomersCount);
