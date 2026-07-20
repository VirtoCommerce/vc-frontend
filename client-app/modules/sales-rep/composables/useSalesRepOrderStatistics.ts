import { useQuery } from "@vue/apollo-composable";
import { computed, toValue } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepCustomerOrderStatisticsDocument } from "../api/graphql/types";
import { NEW_ORDERS_FILTER } from "../constants";
import { buildStatisticsWindows } from "../utils";
import type { Ref } from "vue";

type UseSalesRepOrderStatisticsOptionsType = {
  // Scope to one customer (the customer profile); omit for the cross-customer dashboard.
  // Expanded union (not MaybeRefOrGetter<… | undefined>) to avoid the redundant "undefined" — Sonar S4782.
  organizationId?: string | Ref<string | undefined> | (() => string | undefined);
};

// SOURCE: one composable owning the salesRepCustomerOrderStatistics op. All period/comparison slices
// (week, mtd, ytd, sinceDate, newOrders, newOrdersToday, and the week/month/year vs-previous comparisons)
// are aliased into the single query, so both the dashboard mapper (week/mtd/ytd/newOrders slices) and the
// customer mapper (ytd/sinceDate slices) read from one round trip; the backend coalesces overlapping ranges.
// The window vars (spread from buildStatisticsWindows) are current=period-start→now, previous=elapsed-matched.
export function useSalesRepOrderStatistics(options: UseSalesRepOrderStatisticsOptionsType = {}) {
  const variables = computed(() => ({
    organizationId: toValue(options.organizationId),
    storeId: globals.storeId,
    currencyCode: globals.currencyCode,
    cultureName: globals.cultureName,
    newOrdersFilter: NEW_ORDERS_FILTER,
    ...buildStatisticsWindows(),
  }));

  const { result, loading, onError } = useQuery(SalesRepCustomerOrderStatisticsDocument, variables);

  onError((error) => {
    // No toast; the mapped cards fall back to placeholders.
    Logger.error("[sales-rep] salesRepCustomerOrderStatistics failed:", error);
  });

  const statistics = computed(() => result.value?.salesRepCustomerOrderStatistics);

  return { statistics, loading };
}
