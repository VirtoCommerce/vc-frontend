import { createSharedComposable } from "@vueuse/core";
import { computed, readonly, ref, shallowRef } from "vue";
import {
  activateBackInStockSubscription,
  deactivateBackInStockSubscription,
  getBackInStockSubscriptions,
} from "@/core/api/graphql/backInStock";
import { DEFAULT_SORT } from "@/core/constants";
import { getSortingExpression, Logger } from "@/core/utilities";
import type {
  ActivateBackInStockSubscriptionCommandType,
  BackInStockSubscriptionQueryType,
  BackInStockSubscriptionType,
  DeactivateBackInStockSubscriptionCommandType,
} from "@/core/api/graphql/types";
import type { ISortInfo } from "@/core/types";
import type { Ref } from "vue";

const DEFAULT_ITEMS_PER_PAGE = 9999;
const loading = ref(true);
const backInStockSubscriptions = shallowRef<BackInStockSubscriptionQueryType[]>([]);
const itemsPerPage: Ref<number> = ref(DEFAULT_ITEMS_PER_PAGE);
const pages: Ref<number> = ref(0);
const page: Ref<number> = ref(1);
const keyword: Ref<string> = ref("");
const sort: Ref<ISortInfo> = ref(DEFAULT_SORT);
const lastFetched: Ref<number | null> = ref(null);

createSharedComposable(useBackInStockSubscriptions);

export function useBackInStockSubscriptions(options: { autoRefetch: boolean } = { autoRefetch: true }) {
  async function activateSubscription(
    payload: ActivateBackInStockSubscriptionCommandType,
  ): Promise<BackInStockSubscriptionType | undefined> {
    let newSubscription: BackInStockSubscriptionType | undefined;
    loading.value = true;

    try {
      newSubscription = await activateBackInStockSubscription(payload);
    } catch (e) {
      Logger.error(`${useBackInStockSubscriptions.name}.${useBackInStockSubscriptions.name}`, e);
      throw e;
    }

    if (options.autoRefetch) {
      await fetchSubscriptions();
    }

    return newSubscription;
  }

  async function deactivateSubscription(
    payload: DeactivateBackInStockSubscriptionCommandType,
  ): Promise<BackInStockSubscriptionType | undefined> {
    let newSubscription: BackInStockSubscriptionType | undefined;
    loading.value = true;

    try {
      newSubscription = await deactivateBackInStockSubscription(payload);
    } catch (e) {
      Logger.error(`${useBackInStockSubscriptions.name}.${useBackInStockSubscriptions.name}`, e);
      throw e;
    }

    if (options.autoRefetch) {
      await fetchSubscriptions();
    }

    return newSubscription;
  }

  async function fetchSubscriptions(): Promise<void> {
    loading.value = true;

    const sortingExpression = getSortingExpression(sort.value);

    try {
      const response = await getBackInStockSubscriptions({
        first: itemsPerPage.value,
        after: String((page.value - 1) * itemsPerPage.value),
        keyword: keyword.value.trim(),
        sort: sortingExpression,
      });

      backInStockSubscriptions.value = response.items ?? [];
      pages.value = Math.ceil((response.totalCount ?? 0) / itemsPerPage.value);
      lastFetched.value = Date.now();
    } catch (e) {
      Logger.error("useUserQuotes.fetchQuotes", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    fetchSubscriptions,
    activateSubscription,
    deactivateSubscription,
    itemsPerPage,
    pages,
    page,
    keyword,
    sort,
    loading: readonly(loading),
    backInStockSubscriptions: computed(() => backInStockSubscriptions.value),
  };
}
