import { computed } from "vue";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_ID_XPICKUP, XPICKUP_ENABLED_KEY } from "@/core/constants/modules";

export function useXPickup() {
  const { isEnabled: isXPickupEnabled } = useModuleSettings(MODULE_ID_XPICKUP);

  const xPickupEnabled = computed(() => isXPickupEnabled(XPICKUP_ENABLED_KEY));

  return {
    xPickupEnabled,
  };
}
