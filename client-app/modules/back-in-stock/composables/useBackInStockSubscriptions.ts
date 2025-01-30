import { createSharedComposable, watchDebounced } from "@vueuse/core";
import difference from "lodash/difference";
import { readonly, ref } from "vue";
import { DEFAULT_SORT } from "@/core/constants";
import { SortDirection } from "@/core/enums";
import { Sort } from "@/core/types/search/sorting";
import { getSortingExpression, Logger } from "@/core/utilities";
import {
  activateBackInStockSubscription,
  deactivateBackInStockSubscription,
  getBackInStockSubscriptions,
} from "../api/graphql";
import type {
  ActivateBackInStockSubscriptionCommandType,
  BackInStockSubscriptionConnection,
  BackInStockSubscriptionType,
  DeactivateBackInStockSubscriptionCommandType,
  QueryBackInStockSubscriptionsArgs,
} from "../api/graphql/types";
import type { PaginationType } from "../types";

const DEFAULT_ITEMS_PER_PAGE = 10;
const DEBOUNCE_IN_MS = 300;

function _useBackInStockSubscriptions() {
  const fetching = ref(false);
  const subscriptions = ref<BackInStockSubscriptionType[]>([]);
  const pendingProductIds = ref<Set<string>>(new Set());
  const shownProductIds = ref<string[]>([]);
  const pagination = ref<PaginationType>({
    page: 1,
    pages: 0,
    itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
    totalCount: 0,
  });

  function updateSubscriptionInList(subscription: BackInStockSubscriptionType): void {
    const index = subscriptions.value.findIndex((item) => item.id === subscription.id);
    if (index !== -1) {
      subscriptions.value[index] = subscription;
    } else {
      subscriptions.value.push(subscription);
    }
  }

  async function handleSubscriptionAction(
    payload: ActivateBackInStockSubscriptionCommandType | DeactivateBackInStockSubscriptionCommandType,
    action: typeof activateBackInStockSubscription | typeof deactivateBackInStockSubscription,
  ): Promise<BackInStockSubscriptionType | undefined> {
    pendingProductIds.value.add(payload.productId);
    try {
      const newSubscription = await action(payload);
      if (newSubscription) {
        updateSubscriptionInList(newSubscription);
      }
      return newSubscription;
    } catch (e) {
      Logger.error(`${useBackInStockSubscriptions.name}.${action.name}`, e);
    } finally {
      pendingProductIds.value.delete(payload.productId);
    }
  }

  function activateSubscription(payload: ActivateBackInStockSubscriptionCommandType) {
    return handleSubscriptionAction(payload, activateBackInStockSubscription);
  }

  function deactivateSubscription(payload: DeactivateBackInStockSubscriptionCommandType) {
    return handleSubscriptionAction(payload, deactivateBackInStockSubscription);
  }

  async function _fetchSubscriptions(
    payload: QueryBackInStockSubscriptionsArgs = {},
  ): Promise<BackInStockSubscriptionConnection | undefined> {
    fetching.value = true;
    const {
      first = pagination.value.itemsPerPage,
      after = String((pagination.value.page - 1) * pagination.value.itemsPerPage),
      keyword = "",
      sort = `${getSortingExpression(new Sort("isActive", SortDirection.Ascending))};${getSortingExpression(DEFAULT_SORT)}`,
      isActive,
      productIds,
    } = payload;

    try {
      return await getBackInStockSubscriptions({
        first,
        after,
        keyword,
        sort,
        isActive,
        productIds,
      });
    } catch (e) {
      Logger.error("useBackInStockSubscriptions.fetchSubscriptions", e);
    } finally {
      fetching.value = false;
    }
  }

  async function fetchSubscriptionsByProductIds(productIds: string[]): Promise<void> {
    productIds?.forEach((id) => pendingProductIds.value.add(id));
    const response = await _fetchSubscriptions({ productIds, first: productIds.length });
    subscriptions.value = [...subscriptions.value, ...(response?.items ?? [])];
    productIds?.forEach((id) => pendingProductIds.value.delete(id));
  }

  async function fetchSubscriptions(payload?: QueryBackInStockSubscriptionsArgs): Promise<void> {
    const response = await _fetchSubscriptions(payload);
    subscriptions.value = response?.items ?? [];
    pagination.value.totalCount = response?.totalCount ?? 0;
    pagination.value.pages = Math.ceil((response?.totalCount ?? 0) / pagination.value.itemsPerPage);
  }

  function addShownProductId(productId: string) {
    shownProductIds.value = [...shownProductIds.value, productId];
  }

  function removeShownProductId(productId: string) {
    shownProductIds.value = shownProductIds.value.filter((id) => id !== productId);
  }

  function isProductSubscriptionPending(productId: string): boolean {
    return pendingProductIds.value.has(productId);
  }

  function isProductSubscriptionActive(productId?: string): boolean {
    if (!productId) {
      return false;
    }
    return subscriptions.value.some((item) => item.productId === productId && item.isActive);
  }

  watchDebounced(
    shownProductIds,
    (newProductIds, oldProductIds) => {
      const diff = difference(newProductIds, oldProductIds ?? []);
      if (diff.length) {
        void fetchSubscriptionsByProductIds(Array.from(diff));
      }
    },
    { debounce: DEBOUNCE_IN_MS, immediate: true },
  );

  return {
    fetchSubscriptions,
    activateSubscription,
    deactivateSubscription,
    isProductSubscriptionPending,
    isProductSubscriptionActive,
    addShownProductId,
    removeShownProductId,
    pagination: pagination,
    fetching: readonly(fetching),
    subscriptions: readonly(subscriptions),
  };
}

export const useBackInStockSubscriptions = createSharedComposable(_useBackInStockSubscriptions);
