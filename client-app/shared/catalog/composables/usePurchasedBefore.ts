import { createGlobalState } from "@vueuse/core";
import { computed } from "vue";
import { useModuleSettings } from "@/core/composables/useModuleSettings";

export const ORDERS_MODULE_ID = "VirtoCommerce.Orders";
export const PURCHASED_BEFORE_ENABLED_KEY = "Order.PurchasedProductStoreFilter.Enable";

export function _usePurchasedBefore() {
  const { isEnabled } = useModuleSettings(ORDERS_MODULE_ID);

  const isPurchasedBeforeEnabled = computed(() => isEnabled(PURCHASED_BEFORE_ENABLED_KEY));

  return {
    isPurchasedBeforeEnabled,
  };
}

export const usePurchasedBefore = createGlobalState(_usePurchasedBefore);
