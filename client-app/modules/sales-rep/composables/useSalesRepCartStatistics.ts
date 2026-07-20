import { useQuery } from "@vue/apollo-composable";
import { computed, toValue } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepCustomerCartStatisticsDocument } from "../api/graphql/types";
import { ACTIVE_CARTS_FILTER } from "../constants";
import { buildStatisticsWindows } from "../utils";
import type { Ref } from "vue";

type UseSalesRepCartStatisticsOptionsType = {
  organizationId?: string | Ref<string | undefined> | (() => string | undefined);
};

// SOURCE: one composable owning the salesRepCustomerCartStatistics op. Two aliased slices from one round trip:
// "activeCarts" (the built-in "active-carts" kind = non-empty, non-project carts, all-time) backs the dashboard
// "Active carts" card; "newCartsThisWeek" (same kind, week-to-date by cart created date) backs its delta.
export function useSalesRepCartStatistics(options: UseSalesRepCartStatisticsOptionsType = {}) {
  const variables = computed(() => {
    const windows = buildStatisticsWindows();
    return {
      organizationId: toValue(options.organizationId),
      storeId: globals.storeId,
      currencyCode: globals.currencyCode,
      cultureName: globals.cultureName,
      cartFilter: ACTIVE_CARTS_FILTER,
      weekFrom: windows.weekFrom,
      weekTo: windows.weekTo,
    };
  });

  const { result, loading, onError } = useQuery(SalesRepCustomerCartStatisticsDocument, variables);

  onError((error) => {
    Logger.error("[sales-rep] salesRepCustomerCartStatistics failed:", error);
  });

  const statistics = computed(() => result.value?.salesRepCustomerCartStatistics);

  return { statistics, loading };
}
