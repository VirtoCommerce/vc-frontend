import { computed } from "vue";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_ID_OTP, OTP_ENABLED_KEY } from "@/core/constants/modules";

export function useEmailOtpAuthentication() {
  const { isEnabled: isOtpEnabled } = useModuleSettings(MODULE_ID_OTP);

  const hasEmailOtpAuthentication = computed(() => isOtpEnabled(OTP_ENABLED_KEY));

  return {
    hasEmailOtpAuthentication,
  };
}
