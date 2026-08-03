import { useQuery } from "@vue/apollo-composable";
import { computed, toValue } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepCustomerOrderStatisticsDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY, NEW_ORDERS_FILTER } from "../constants";
import { buildStatisticsWindows } from "../utils";
import type { Ref } from "vue";

type UseSalesRepOrderStatisticsOptionsType = {
  // Scope to one customer (the customer profile); omit for the cross-customer dashboard.
  // Expanded union (not MaybeRefOrGetter<… | undefined>) to avoid the redundant "undefined" — Sonar S4782.
  organizationId?: string | Ref<string | undefined> | (() => string | undefined);
};

// One composable owns the salesRepCustomerOrderStatistics op; all period/comparison slices are aliased
// into a single query shared by the dashboard and customer mappers.
export function useSalesRepOrderStatistics(options: UseSalesRepOrderStatisticsOptionsType = {}) {
  const variables = computed(() => ({
    organizationId: toValue(options.organizationId),
    storeId: globals.storeId,
    currencyCode: globals.currencyCode,
    cultureName: globals.cultureName,
    newOrdersFilter: NEW_ORDERS_FILTER,
    ...buildStatisticsWindows(),
  }));

  const { result, loading, onError } = useQuery(SalesRepCustomerOrderStatisticsDocument, variables, {
    fetchPolicy: HUB_FETCH_POLICY,
  });

  onError((error) => {
    // No toast; the mapped cards fall back to placeholders.
    Logger.error("[sales-rep] salesRepCustomerOrderStatistics failed:", error);
  });

  const statistics = computed(() => result.value?.salesRepCustomerOrderStatistics);

  return { statistics, loading };
}
