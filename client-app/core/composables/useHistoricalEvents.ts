import { pushHistoricalEvent as pushHistoricalEventMutation } from "@/core/api/graphql/common/mutations";
import { MODULE_ID_XRECOMMEND } from "@/core/constants/modules";
import { useUser } from "@/shared/account/composables/useUser";
import { useModuleSettings } from "./useModuleSettings";
import type { InputPushHistoricalEventType } from "../api/graphql/types";

const XRECOMMEND_ENABLED_KEY = "XRecommend.RecommendationsEnabled";

export function useHistoricalEvents() {
  const { isAuthenticated } = useUser();
  const { hasModuleSettings, isEnabled } = useModuleSettings(MODULE_ID_XRECOMMEND);

  function pushHistoricalEvent(payload: InputPushHistoricalEventType, sendUnauthenticated?: false): Promise<void> {
    if (!hasModuleSettings.value || !isEnabled(XRECOMMEND_ENABLED_KEY)) {
      return Promise.resolve();
    }
    if (sendUnauthenticated || isAuthenticated.value) {
      return pushHistoricalEventMutation(payload);
    }
    return Promise.resolve();
  }

  return {
    pushHistoricalEvent,
  };
}
