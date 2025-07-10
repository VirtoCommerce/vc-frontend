import { useSessionStorage } from "@vueuse/core";
import { computed, ref } from "vue";
import { useGetSearchHistoryQuery as _useGetSearchHistoryQuery } from "@/core/api/graphql/common";
import {
  pushHistoricalEvent as pushHistoricalEventMutation,
  saveSearchQuery as saveSearchQueryMutation,
} from "@/core/api/graphql/common/mutations";
import { MODULE_ID_XRECOMMEND, XRECOMMEND_ENABLED_KEY } from "@/core/constants/modules";
import { DEFAULT_SEARCH_HISTORY_MAX_COUNT } from "@/core/constants/search";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities/logger";
import { useUser } from "@/shared/account/composables/useUser";
import { useShortCart } from "@/shared/cart/composables";
import { useModuleSettings } from "./useModuleSettings";
import type { InputPushHistoricalEventType } from "@/core/api/graphql/types";

export function useHistoricalEvents() {
  const { isAuthenticated } = useUser();
  const { hasModuleSettings, isEnabled } = useModuleSettings(MODULE_ID_XRECOMMEND);
  const { cart } = useShortCart();

  function pushHistoricalEvent(payload: InputPushHistoricalEventType, sendUnauthenticated?: false): Promise<void> {
    if (!hasModuleSettings.value || !isEnabled(XRECOMMEND_ENABLED_KEY)) {
      return Promise.resolve();
    }
    if (sendUnauthenticated || isAuthenticated.value) {
      return pushHistoricalEventMutation({
        sessionId: cart.value?.id,
        storeId: globals.storeId,
        ...payload,
      });
    }
    return Promise.resolve();
  }

  const localSearchQueries = useSessionStorage<string[]>("search-queries", []);

  async function saveSearchQuery(payload: string) {
    if (!payload) {
      return;
    }

    if (isAuthenticated.value) {
      try {
        await saveSearchQueryMutation({
          query: payload,
        });
      } catch (error) {
        Logger.error("Error saving search query", error);
      }
    } else {
      if (localSearchQueries.value.includes(payload)) {
        const index = localSearchQueries.value.indexOf(payload);
        localSearchQueries.value.splice(index, 1);
        localSearchQueries.value.unshift(payload);
      } else {
        localSearchQueries.value.unshift(payload);
      }

      if (localSearchQueries.value.length > DEFAULT_SEARCH_HISTORY_MAX_COUNT) {
        localSearchQueries.value.splice(DEFAULT_SEARCH_HISTORY_MAX_COUNT, 1);
      }
    }
  }

  function useGetSearchHistoryQuery(payload?: Parameters<typeof _useGetSearchHistoryQuery>[0]) {
    if (isAuthenticated.value) {
      return _useGetSearchHistoryQuery(payload);
    }
    return {
      load: () => Promise.resolve(),
      result: computed(() => ({
        searchHistory: {
          queries: localSearchQueries.value.slice(0, DEFAULT_SEARCH_HISTORY_MAX_COUNT),
        },
      })),
      loading: ref(false),
    };
  }

  return {
    pushHistoricalEvent,
    saveSearchQuery,
    useGetSearchHistoryQuery,
  };
}
