import { computed } from "vue";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import {
  LOYALTY_CURRENCY_KEY,
  LOYALTY_ENABLED_KEY,
  LOYALTY_MODE_KEY,
  LOYALTY_MODULE_ID,
} from "@/core/constants/modules";

const CATALOG_MODES = new Set(["Mixed Cart", "Loyalty Store"]);

export function useLoyaltySettings() {
  const { getSettingValue, isEnabled } = useModuleSettings(LOYALTY_MODULE_ID);

  const loyaltyCurrencyCode = computed(
    () => (getSettingValue(LOYALTY_CURRENCY_KEY) as string | undefined) || undefined,
  );

  // The module being on is not enough to enter the catalog: it also needs a currency to price in
  // and a mode that has a storefront at all. Anything offering a way in asks here, or it offers a
  // way into NotFound — the routes already guard on this, and a control that ignores it lies.
  const isLoyaltyCatalogAvailable = computed(() => {
    const mode = getSettingValue(LOYALTY_MODE_KEY) as string | undefined;

    return isEnabled(LOYALTY_ENABLED_KEY) && !!loyaltyCurrencyCode.value && !!mode && CATALOG_MODES.has(mode);
  });

  return {
    loyaltyCurrencyCode,
    isLoyaltyCatalogAvailable,
  };
}
