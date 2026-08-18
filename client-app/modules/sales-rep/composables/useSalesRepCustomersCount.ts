import { computed } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepCustomersCountDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY } from "../constants";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";

// Count-only query (first: 0, totalCount) for the left-rail badge — deliberately unfiltered so it
// reflects the rep's full total, not the My Customers page's filtered/paged view.
export function useSalesRepCustomersCount() {
  // Shows the same number as the dashboard's "Assigned customers" card — cache-first let the two disagree.
  const { result, onError } = useSalesRepHubQuery(
    SalesRepCustomersCountDocument,
    () => ({ storeId: globals.storeId }),
    {
      fetchPolicy: HUB_FETCH_POLICY,
    },
  );

  onError((error) => {
    // Keep the nav functional (badge just hides); no toasts by design.
    Logger.error("[sales-rep] salesRepCustomers count failed:", error);
  });

  const count = computed(() => result.value?.salesRepCustomers?.totalCount ?? 0);

  return { count };
}
