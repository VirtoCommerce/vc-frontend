import { createSharedComposable, watchDebounced } from "@vueuse/core";
import difference from "lodash/difference";
import { readonly, ref, shallowRef } from "vue";
import { DEFAULT_SORT } from "@/core/constants";
import { getSortingExpression, Logger } from "@/core/utilities";
import {
  activateBackInStockSubscription,
  deactivateBackInStockSubscription,
  getBackInStockSubscriptions,
} from "../api/graphql";
import type {
  ActivateBackInStockSubscriptionCommandType,
  BackInStockSubscriptionType,
  DeactivateBackInStockSubscriptionCommandType,
  QueryBackInStockSubscriptionsArgs,
} from "../api/graphql/types";
import type { PaginationType } from "../types";

const DEFAULT_ITEMS_PER_PAGE = 10;
const DEBOUNCE_IN_MS = 300;

function _useBackInStockSubscriptions() {
  const fetching = ref(false);
  const subscriptions = shallowRef<BackInStockSubscriptionType[]>([]);
  const pendingProductIds = ref<Set<string>>(new Set());
  const shownProductIds = ref<string[]>([]);
  const pagination = ref<PaginationType>({
    page: 1,
    pages: 0,
    itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
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
      throw e;
    } finally {
      pendingProductIds.value.delete(payload.productId);
    }
  }

  const activateSubscription = (payload: ActivateBackInStockSubscriptionCommandType) =>
    handleSubscriptionAction(payload, activateBackInStockSubscription);

  const deactivateSubscription = (payload: DeactivateBackInStockSubscriptionCommandType) =>
    handleSubscriptionAction(payload, deactivateBackInStockSubscription);

  async function fetchSubscriptions(payload?: QueryBackInStockSubscriptionsArgs, partialUpdate = false): Promise<void> {
    fetching.value = true;
    const {
      first = pagination.value.itemsPerPage,
      after = String((pagination.value.page - 1) * pagination.value.itemsPerPage),
      keyword = "",
      sort = getSortingExpression(DEFAULT_SORT),
      isActive,
      productIds,
    } = payload ?? {};

    const requestProductIds = payload?.productIds;
    if (requestProductIds?.length) {
      requestProductIds.forEach((id) => pendingProductIds.value.add(id));
    }

    try {
      const response = await getBackInStockSubscriptions({
        first,
        after,
        keyword,
        sort,
        isActive,
        productIds,
      });

      if (partialUpdate) {
        subscriptions.value = [...subscriptions.value, ...(response.items ?? [])];
      } else {
        subscriptions.value = response.items ?? [];
        pagination.value.pages = Math.ceil((response.totalCount ?? 0) / first);
      }
    } catch (e) {
      Logger.error("useBackInStockSubscriptions.fetchSubscriptions", e);
      subscriptions.value = [];
    } finally {
      if (requestProductIds?.length) {
        requestProductIds.forEach((id) => pendingProductIds.value.delete(id));
      }
      fetching.value = false;
    }
  }

  const addShownProductId = (productId: string) => {
    shownProductIds.value = [...shownProductIds.value, productId];
  };

  const removeShownProductId = (productId: string) => {
    shownProductIds.value = shownProductIds.value.filter((id) => id !== productId);
  };

  const isProductSubscriptionPending = (productId: string): boolean => pendingProductIds.value.has(productId);

  const isProductSubscriptionActive = (productId: string): boolean =>
    subscriptions.value.some((item) => item.productId === productId && item.isActive);

  watchDebounced(
    shownProductIds,
    (newProductIds, oldProductIds) => {
      const diff = difference(newProductIds, oldProductIds ?? []);
      if (diff.length) {
        void fetchSubscriptions(
          {
            productIds: Array.from(diff),
            first: diff.length,
          },
          true,
        );
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
