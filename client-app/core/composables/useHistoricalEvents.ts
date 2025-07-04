import { useGetSearchHistoryQuery } from "@/core/api/graphql/common";
import {
  pushHistoricalEvent as pushHistoricalEventMutation,
  saveSearchQuery as saveSearchQueryMutation,
} from "@/core/api/graphql/common/mutations";
import { MODULE_ID_XRECOMMEND, XRECOMMEND_ENABLED_KEY } from "@/core/constants/modules";
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

  async function saveSearchQuery(payload: string) {
    try {
      await saveSearchQueryMutation({
        query: payload,
      });
    } catch (error) {
      Logger.error("Error saving search query", error);
    }
  }

  return {
    pushHistoricalEvent,
    saveSearchQuery,
    useGetSearchHistoryQuery,
  };
}
