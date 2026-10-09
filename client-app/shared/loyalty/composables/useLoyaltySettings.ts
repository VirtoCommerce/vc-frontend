import { computed } from "vue";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { LOYALTY_CURRENCY_KEY, LOYALTY_MODULE_ID } from "@/core/constants/modules";

export function useLoyaltySettings() {
  const { getSettingValue } = useModuleSettings(LOYALTY_MODULE_ID);

  const loyaltyCurrencyCode = computed(
    () => (getSettingValue(LOYALTY_CURRENCY_KEY) as string | undefined) || undefined,
  );

  return {
    loyaltyCurrencyCode,
  };
}
