import { computed } from "vue";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_ID_OTP, OTP_ENABLED_KEY } from "@/core/constants/modules";

export function useOtpEmailAuthentication() {
  const { isEnabled: isOtpEnabled } = useModuleSettings(MODULE_ID_OTP);

  const hasOtpEmailAuthentication = computed(() => isOtpEnabled(OTP_ENABLED_KEY));

  return {
    hasOtpEmailAuthentication,
  };
}
