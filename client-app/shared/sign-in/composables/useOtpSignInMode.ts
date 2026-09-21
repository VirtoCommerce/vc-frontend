import { computed, ref } from "vue";
import type { ComputedRef, Ref } from "vue";

export type OtpStepType = "request" | "verify" | "locked" | "generic";

export function useOtpSignInMode(hasOtpEmailAuthentication: Ref<boolean> | ComputedRef<boolean>) {
  const signInMode = ref<"password" | "otp">(hasOtpEmailAuthentication.value ? "otp" : "password");
  const showOtpEmailForm = computed(() => hasOtpEmailAuthentication.value && signInMode.value === "otp");

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
    showOtpEmailForm,
    otpStep,
    switchToOtp,
    switchToPassword,
  };
}
