import { useQuery } from "@vue/apollo-composable";
import { computed, toValue } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepCustomerCartStatisticsDocument } from "../api/graphql/types";
import { ACTIVE_CARTS_FILTER, HUB_FETCH_POLICY } from "../constants";
import { buildStatisticsWindows } from "../utils";
import type { Ref } from "vue";

type UseSalesRepCartStatisticsOptionsType = {
  organizationId?: string | Ref<string | undefined> | (() => string | undefined);
};

// Two aliased slices from one query: activeCarts backs the "Active carts" card, newCartsThisWeek backs its delta.
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

  const { result, loading, onError } = useQuery(SalesRepCustomerCartStatisticsDocument, variables, {
    fetchPolicy: HUB_FETCH_POLICY,
  });

  onError((error) => {
    Logger.error("[sales-rep] salesRepCustomerCartStatistics failed:", error);
  });

  const statistics = computed(() => result.value?.salesRepCustomerCartStatistics);

  return { statistics, loading };
}
