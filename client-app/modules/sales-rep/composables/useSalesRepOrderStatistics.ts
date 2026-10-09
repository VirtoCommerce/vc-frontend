import { computed, toValue } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { buildStatisticsWindows } from "@/shared/dashboard";
import { SalesRepCustomerOrderStatisticsDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY, NEW_ORDERS_FILTER } from "../constants";
import { needsOrderStatistics, orderStatisticsFlags } from "../layout/stat-data-needs";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";
import type { StatDataNeedType } from "../types/widgets";
import type { StatDataNeedsType } from "@/shared/dashboard";
import type { Ref } from "vue";

// `needs`/`ready` come from the page's layout (`useStatDataNeeds`): the visible cards decide what this asks for.
type UseSalesRepOrderStatisticsOptionsType = StatDataNeedsType<StatDataNeedType> & {
  // Scope to one customer (the customer profile); omit for the cross-customer dashboard.
  // Expanded union (not MaybeRefOrGetter<… | undefined>) to avoid the redundant "undefined" — Sonar S4782.
  organizationId?: string | Ref<string | undefined> | (() => string | undefined);
};

// One composable owns the salesRepCustomerOrderStatistics op; all period/comparison slices are aliased
// into a single query shared by the dashboard and customer mappers. Which of them it actually asks for
// comes from the cards the rep can see, so the two surfaces no longer pay for each other's slices
// (VCST-5647) — and with none of them needed, the query does not run.
export function useSalesRepOrderStatistics(options: UseSalesRepOrderStatisticsOptionsType) {
  const { needs, ready } = options;

  const variables = computed(() => ({
    organizationId: toValue(options.organizationId),
    storeId: globals.storeId,
    currencyCode: globals.currencyCode,
    cultureName: globals.cultureName,
    newOrdersFilter: NEW_ORDERS_FILTER,
    ...buildStatisticsWindows(),
    ...orderStatisticsFlags(needs.value),
  }));

  const enabled = computed(() => ready.value && needsOrderStatistics(needs.value));

  const { result, loading, error, onError } = useSalesRepHubQuery(SalesRepCustomerOrderStatisticsDocument, variables, {
    fetchPolicy: HUB_FETCH_POLICY,
    enabled,
    keepPreviousResult: true,
  });

  onError((err) => {
    // No toast; `error` is surfaced on the cards themselves (VCST-5586).
    Logger.error("[sales-rep] salesRepCustomerOrderStatistics failed:", err);
  });

  const statistics = computed(() => result.value?.salesRepCustomerOrderStatistics);

  return {
    statistics,
    // Waiting on the layout is still waiting: the cards must not read as zeros in the meantime.
    loading: computed(() => !ready.value || loading.value),
    error,
  };
}
