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
import type { FetchParametersType, PaginationType } from "../types";

const DEFAULT_ITEMS_PER_PAGE = 10;
const DEBOUNCE_IN_MS = 300;

const fetching = ref(false);
const subscriptions = shallowRef<BackInStockSubscriptionType[]>([]);
const pendingProductIds = ref<Set<string>>(new Set());
const visibleProductIds = ref<string[]>([]);

const pagination = ref<PaginationType>({
  page: 1,
  pages: 0,
  itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
});
const fetchParameters = ref<FetchParametersType>({
  keyword: "",
  sort: DEFAULT_SORT,
  productIds: undefined,
});

function updateSubscription(subscription: BackInStockSubscriptionType) {
  const index = subscriptions.value.findIndex((item) => item.id === subscription.id);
  if (index !== -1) {
    subscriptions.value[index] = subscription;
  } else {
    subscriptions.value.push(subscription);
  }
}

function _useBackInStockSubscriptions() {
  async function activateSubscription(
    payload: ActivateBackInStockSubscriptionCommandType,
  ): Promise<BackInStockSubscriptionType | undefined> {
    let newSubscription: BackInStockSubscriptionType | undefined;
    pendingProductIds.value.add(payload.productId);
    try {
      newSubscription = await activateBackInStockSubscription(payload);
      if (newSubscription) {
        updateSubscription(newSubscription);
      }
    } catch (e) {
      Logger.error(`${useBackInStockSubscriptions.name}.${activateSubscription.name}`, e);
      throw e;
    } finally {
      pendingProductIds.value.delete(payload.productId);
    }

    return newSubscription;
  }

  async function deactivateSubscription(
    payload: DeactivateBackInStockSubscriptionCommandType,
  ): Promise<BackInStockSubscriptionType | undefined> {
    let newSubscription: BackInStockSubscriptionType | undefined;
    pendingProductIds.value.add(payload.productId);
    try {
      newSubscription = await deactivateBackInStockSubscription(payload);
      if (newSubscription) {
        updateSubscription(newSubscription);
      }
    } catch (e) {
      Logger.error(`${useBackInStockSubscriptions.name}.${deactivateSubscription.name}`, e);
      throw e;
    } finally {
      pendingProductIds.value.delete(payload.productId);
    }

    return newSubscription;
  }

  async function fetchSubscriptions(payload?: QueryBackInStockSubscriptionsArgs, partial = false): Promise<void> {
    fetching.value = true;
    const {
      first = pagination.value.itemsPerPage,
      after = String((pagination.value.page - 1) * pagination.value.itemsPerPage),
      keyword = fetchParameters.value.keyword.trim(),
      sort = getSortingExpression(fetchParameters.value.sort),
      isActive,
      productIds = fetchParameters.value.productIds,
    } = payload ?? {};
    if (payload?.productIds?.length) {
      payload.productIds.forEach((productId) => pendingProductIds.value.add(productId));
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

      if (partial) {
        subscriptions.value = [...subscriptions.value, ...(response.items ?? [])];
      } else {
        subscriptions.value = response.items ?? [];
        pagination.value.pages = Math.ceil(
          (response.totalCount ?? 0) / (payload?.first ?? pagination.value.itemsPerPage),
        );
      }
    } catch (e) {
      Logger.error("useBackInStockSubscriptions.fetchSubscriptions", e);
      subscriptions.value = [];
    } finally {
      if (payload?.productIds?.length) {
        payload.productIds.forEach((productId) => pendingProductIds.value.delete(productId));
      }
      fetching.value = false;
    }
  }

  function addVisibleProductId(productId: string) {
    visibleProductIds.value = [...visibleProductIds.value, productId];
  }

  function removeVisibleProductId(productId: string) {
    visibleProductIds.value = visibleProductIds.value.filter((id) => id !== productId);
  }

  function isProductSubscriptionPending(productId: string) {
    return pendingProductIds.value.has(productId);
  }

  function isProductSubscriptionActive(productId: string) {
    return subscriptions.value.some((item) => item.productId === productId && item.isActive);
  }

  watchDebounced(
    visibleProductIds,
    (newProductIds, oldProductIds) => {
      const diff = difference(newProductIds, oldProductIds ?? []);
      if (!diff.length) {
        return;
      }
      void fetchSubscriptions(
        {
          productIds: Array.from(diff),
          first: diff.length,
        },
        true,
      );
    },
    {
      debounce: DEBOUNCE_IN_MS,
      immediate: true,
    },
  );

  return {
    fetchSubscriptions,
    activateSubscription,
    deactivateSubscription,
    isProductSubscriptionPending,
    isProductSubscriptionActive,
    addVisibleProductId,
    removeVisibleProductId,
    pagination,
    fetchParameters,
    fetching: readonly(fetching),
    subscriptions: readonly(subscriptions),
  };
}

export const useBackInStockSubscriptions = createSharedComposable(_useBackInStockSubscriptions);
