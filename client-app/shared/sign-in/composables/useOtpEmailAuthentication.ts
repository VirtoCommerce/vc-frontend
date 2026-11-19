import { computed } from "vue";
import { useThemeContext } from "@/core/composables/useThemeContext";

const OTP_AUTHENTICATION_TYPE = "OTP";

export function useOtpEmailAuthentication() {
  const { themeContext } = useThemeContext();

  const hasOtpEmailAuthentication = computed<boolean>(
    () => themeContext.value.storeSettings?.authenticationTypes?.includes(OTP_AUTHENTICATION_TYPE) ?? false,
  );

  return {
    hasOtpEmailAuthentication,
  };
}
