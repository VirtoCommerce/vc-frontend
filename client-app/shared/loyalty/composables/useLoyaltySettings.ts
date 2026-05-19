import { computed } from "vue";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import {
  LOYALTY_CURRENCY_KEY,
  LOYALTY_ENABLED_KEY,
  LOYALTY_MODE_KEY,
  LOYALTY_MODULE_ID,
} from "@/core/constants/modules";

export function useLoyaltySettings() {
  const { isEnabled, getSettingValue } = useModuleSettings(LOYALTY_MODULE_ID);

  const isLoyaltyEnabled = computed(() => isEnabled(LOYALTY_ENABLED_KEY));
  const loyaltyMode = computed(() => (getSettingValue(LOYALTY_MODE_KEY) as string | undefined) || undefined);
  const loyaltyCurrencyCode = computed(
    () => (getSettingValue(LOYALTY_CURRENCY_KEY) as string | undefined) || undefined,
  );

  return {
    isLoyaltyEnabled,
    loyaltyMode,
    loyaltyCurrencyCode,
  };
}
