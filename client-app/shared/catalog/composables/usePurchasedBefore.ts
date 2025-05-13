import { createGlobalState, useLocalStorage } from "@vueuse/core";
import { computed } from "vue";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { PURCHASED_BEFORE_LOCAL_STORAGE } from "@/core/constants";

export const ORDERS_MODULE_ID = "VirtoCommerce.Orders";
export const PURCHASED_BEFORE_ENABLED_KEY = "Order.PurchasedProductStoreFilter.Enable";

export function _usePurchasedBefore() {
  const { isEnabled } = useModuleSettings(ORDERS_MODULE_ID);

  const localStoragePurchasedBefore = useLocalStorage<boolean>(PURCHASED_BEFORE_LOCAL_STORAGE, false);

  const isPurchasedBeforeEnabled = computed(() => isEnabled(PURCHASED_BEFORE_ENABLED_KEY));

  if (!isPurchasedBeforeEnabled.value) {
    localStoragePurchasedBefore.value = false;
  }

  return {
    isPurchasedBeforeEnabled,
  };
}

export const usePurchasedBefore = createGlobalState(_usePurchasedBefore);
