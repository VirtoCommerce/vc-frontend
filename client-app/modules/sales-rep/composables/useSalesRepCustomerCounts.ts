import { computed, toValue } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { buildStatisticsWindows } from "@/shared/dashboard";
import { SalesRepCustomerCountsDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY } from "../constants";
import { needsCustomerCounts } from "../layout/stat-data-needs";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";
import type { StatDataNeedType } from "../types/widgets";
import type { StatDataNeedsType } from "@/shared/dashboard";
import type { Ref } from "vue";

// `needs`/`ready` come from the page's layout (`useStatDataNeeds`): the visible cards decide whether this runs.
type UseSalesRepCustomerCountsOptionsType = StatDataNeedsType<StatDataNeedType> & {
  organizationId?: string | Ref<string | undefined> | (() => string | undefined);
};

// Owns the salesRepCustomerCounts op: served/ordered/new customer counts, backing the "My customers" card.
// That one card is the whole reason for the round trip, so with it hidden the query does not run.
export function useSalesRepCustomerCounts(options: UseSalesRepCustomerCountsOptionsType) {
  const { needs, ready } = options;

  const variables = computed(() => {
    const windows = buildStatisticsWindows();
    return {
      organizationId: toValue(options.organizationId),
      storeId: globals.storeId,
      mtdFrom: windows.mtdFrom,
      mtdTo: windows.mtdTo,
    };
  });

  const enabled = computed(() => ready.value && needsCustomerCounts(needs.value));

  const { result, loading, error, onError } = useSalesRepHubQuery(SalesRepCustomerCountsDocument, variables, {
    fetchPolicy: HUB_FETCH_POLICY,
    enabled,
  });

  onError((err) => {
    Logger.error("[sales-rep] salesRepCustomerCounts failed:", err);
  });

  const counts = computed(() => result.value?.salesRepCustomerCounts);

  return {
    counts,
    loading: computed(() => !ready.value || loading.value),
    error,
  };
}
