import { computed, readonly, ref, shallowRef } from "vue";
import { SortDirection } from "@/core/enums";
import { Sort } from "@/core/types";
import { Logger } from "@/core/utilities";
import { getLoyaltyPointsHistory } from "../api/graphql/queries";
import { DEFAULT_LOYALTY_LOGS_PER_PAGE } from "../constants";
import type { LoyaltyOperationLog } from "../api/graphql/types";
import type { Ref } from "vue";

export function useLoyaltyPointsHistory() {
  const itemsPerPage = ref(DEFAULT_LOYALTY_LOGS_PER_PAGE);
  const historyLogs: Ref<LoyaltyOperationLog[]> = shallowRef<LoyaltyOperationLog[]>([]);
  const loading: Ref<boolean> = ref(false);
  const pages: Ref<number> = ref(0);
  const page: Ref<number> = ref(1);
  const sort: Ref<Sort> = ref(new Sort("createdDate", SortDirection.Descending));

  async function fetchHistory() {
    loading.value = true;

    const payload = {
      sort: sort.value.toString(),
      first: itemsPerPage.value,
      after: String((page.value - 1) * itemsPerPage.value),
    };

    try {
      const response = await getLoyaltyPointsHistory(payload);

      historyLogs.value = (response?.items ?? []) as LoyaltyOperationLog[];
      pages.value = Math.ceil((response?.totalCount ?? 0) / itemsPerPage.value);
    } catch (e) {
      Logger.error(`${useLoyaltyPointsHistory.name}.${fetchHistory.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    fetchHistory,
    sort,
    loading: readonly(loading),
    historyLogs: computed(() => historyLogs.value),
    itemsPerPage,
    pages,
    page,
  };
}
