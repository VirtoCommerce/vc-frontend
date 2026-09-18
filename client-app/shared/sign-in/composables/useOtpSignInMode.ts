import { computed, ref } from "vue";
import type { ComputedRef, Ref } from "vue";

export type OtpStepType = "request" | "verify" | "locked" | "generic";

export function useOtpSignInMode(hasEmailOtpAuthentication: Ref<boolean> | ComputedRef<boolean>) {
  const signInMode = ref<"password" | "otp">(hasEmailOtpAuthentication.value ? "otp" : "password");
  const showEmailOtpForm = computed(() => hasEmailOtpAuthentication.value && signInMode.value === "otp");

  const otpStep = ref<OtpStepType>("request");

  function switchToOtp() {
    otpStep.value = "request";
    signInMode.value = "otp";
  }

  function switchToPassword() {
    otpStep.value = "request";
    signInMode.value = "password";
  }

  return {
    signInMode,
    showEmailOtpForm,
    otpStep,
    switchToOtp,
    switchToPassword,
  };
}
