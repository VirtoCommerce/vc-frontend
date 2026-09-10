import { computed } from "vue";
import { useThemeContext } from "@/core/composables";

const OTP_MODULE_ID = "VirtoCommerce.Otp";
const OTP_ENABLED_SETTING_NAME = "OtpLogin.Enabled";

export function useEmailOtpAuthentication() {
  const { modulesSettings } = useThemeContext();

  const hasEmailOtpAuthentication = computed(() => {
    const otpSetting = modulesSettings.value
      ?.find((module) => module.moduleId === OTP_MODULE_ID)
      ?.settings.find((setting) => setting.name === OTP_ENABLED_SETTING_NAME);

    return otpSetting?.value === true || otpSetting?.value === "true";
  });

  return { hasEmailOtpAuthentication };
}
