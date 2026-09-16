import { createSharedComposable } from "@vueuse/core";
import { computed } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepCustomersCountDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY } from "../constants";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";

// Count-only query (first: 0, totalCount) for the left-rail badge — deliberately unfiltered so it
// reflects the rep's full total, not the My Customers page's filtered/paged view.
export function useSalesRepCustomersCount() {
  // Must not throw: the shared wrapper below counts a subscriber before it runs this, so a throw
  // leaves it holding an undefined state forever and every later surface reads `undefined`.
  try {
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

    return { count: computed(() => result.value?.salesRepCustomers?.totalCount ?? 0) };
  } catch (error) {
    Logger.error("[sales-rep] salesRepCustomers count could not start:", error);

    return { count: computed(() => 0) };
  }
}

/**
 * One query for however many nav surfaces show the badge, stopped when the last unmounts. The
 * trade-off: on an account page the desktop rail keeps a subscriber alive (it is hidden by CSS,
 * not unmounted), so opening the mobile menu there reuses that state instead of refetching — both
 * surfaces then agree, which is the point, at the cost of a badge as old as the page.
 */
export const useSharedSalesRepCustomersCount = createSharedComposable(useSalesRepCustomersCount);
