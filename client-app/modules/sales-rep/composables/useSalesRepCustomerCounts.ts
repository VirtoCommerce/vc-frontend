import { useQuery } from "@vue/apollo-composable";
import { computed, toValue } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepCustomerCountsDocument } from "../api/graphql/types";
import { buildStatisticsWindows } from "../utils";
import type { Ref } from "vue";

type UseSalesRepCustomerCountsOptionsType = {
  organizationId?: string | Ref<string | undefined> | (() => string | undefined);
};

// SOURCE: one composable owning the salesRepCustomerCounts op — how many customers the rep serves,
// how many ordered this month and how many are new, with a month-over-month comparison. Backs the
// dashboard "My customers" card.
export function useSalesRepCustomerCounts(options: UseSalesRepCustomerCountsOptionsType = {}) {
  const variables = computed(() => {
    const windows = buildStatisticsWindows();
    return {
      organizationId: toValue(options.organizationId),
      storeId: globals.storeId,
      mtdFrom: windows.mtdFrom,
      mtdTo: windows.mtdTo,
      prevFrom: windows.prevFrom,
      prevTo: windows.prevTo,
    };
  });

  const { result, loading, onError } = useQuery(SalesRepCustomerCountsDocument, variables);

  onError((error) => {
    Logger.error("[sales-rep] salesRepCustomerCounts failed:", error);
  });

  const counts = computed(() => result.value?.salesRepCustomerCounts);

  return { counts, loading };
}
