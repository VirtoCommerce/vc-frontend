import { createSharedComposable } from "@vueuse/core";
import { computed, ref, shallowRef } from "vue";
import { DEFAULT_SORT } from "@/core/constants";
import { getSortingExpression, Logger } from "@/core/utilities";
import {
  activateBackInStockSubscription,
  deactivateBackInStockSubscription,
  getBackInStockSubscriptions,
} from "../api/graphql";
import type {
  ActivateBackInStockSubscriptionCommandType,
  BackInStockSubscriptionQueryType,
  BackInStockSubscriptionType,
  DeactivateBackInStockSubscriptionCommandType,
  QueryGetBackInStockSubscriptionsArgs,
} from "../api/graphql/types";
import type { ISortInfo } from "@/core/types";
import type { Ref } from "vue";

const DEFAULT_ITEMS_PER_PAGE = 10;
const loading = ref(true);
const backInStockSubscriptions = shallowRef<BackInStockSubscriptionQueryType[]>([]);
const itemsPerPage: Ref<number> = ref(DEFAULT_ITEMS_PER_PAGE);
const pages: Ref<number> = ref(0);
const page: Ref<number> = ref(1);
const keyword: Ref<string> = ref("");
const sort: Ref<ISortInfo> = ref(DEFAULT_SORT);
const lastFetched: Ref<number | null> = ref(null);
const lastFetchedProductIds: Ref<Array<string> | undefined> = ref([]);

createSharedComposable(useBackInStockSubscriptions);

export function useBackInStockSubscriptions(options: { autoRefetch: boolean } = { autoRefetch: true }) {
  async function activateSubscription(
    payload: ActivateBackInStockSubscriptionCommandType,
  ): Promise<BackInStockSubscriptionType | undefined> {
    let newSubscription: BackInStockSubscriptionType | undefined;
    loading.value = true;

    try {
      newSubscription = await activateBackInStockSubscription(payload);
      if (options.autoRefetch) {
        await fetchSubscriptions({
          productIds: lastFetchedProductIds.value,
          first: lastFetchedProductIds.value?.length,
        });
      }
    } catch (e) {
      Logger.error(`${useBackInStockSubscriptions.name}.${useBackInStockSubscriptions.name}`, e);
      throw e;
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
      if (options.autoRefetch) {
        await fetchSubscriptions({
          productIds: lastFetchedProductIds.value,
          first: lastFetchedProductIds.value?.length,
        });
      }
    } catch (e) {
      Logger.error(`${useBackInStockSubscriptions.name}.${useBackInStockSubscriptions.name}`, e);
      loading.value = false;
      throw e;
    }

    return newSubscription;
  }

  async function fetchSubscriptions(payload?: QueryGetBackInStockSubscriptionsArgs): Promise<void> {
    loading.value = true;
    try {
      const response = await getBackInStockSubscriptions({
        first: payload?.first ?? itemsPerPage.value,
        after: payload?.after ?? String((page.value - 1) * itemsPerPage.value),
        keyword: payload?.keyword ?? keyword.value.trim(),
        sort: payload?.sort ?? getSortingExpression(sort.value),
        isActive: payload?.isActive,
        productIds: payload?.productIds,
      });

      lastFetchedProductIds.value = payload?.productIds;
      backInStockSubscriptions.value = response.items ?? [];
      pages.value = Math.ceil((response.totalCount ?? 0) / (payload?.first ?? itemsPerPage.value));
      lastFetched.value = Date.now();
    } catch (e) {
      Logger.error("useBackInStockSubscriptions.fetchSubscriptions", e);
      backInStockSubscriptions.value = [];
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
    lastFetched,
    loading: computed(() => loading.value),
    backInStockSubscriptions: computed(() => backInStockSubscriptions.value),
  };
}
