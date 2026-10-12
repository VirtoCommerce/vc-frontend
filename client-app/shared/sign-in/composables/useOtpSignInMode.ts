import { computed, ref } from "vue";
import { useAuth } from "@/core/composables/useAuth";
import { OtpStep, SignInMode } from "@/shared/sign-in/enums";
import type { ComputedRef, Ref } from "vue";

export function useOtpSignInMode(hasOtpEmailAuthentication: Ref<boolean> | ComputedRef<boolean>) {
  const signInMode = ref(hasOtpEmailAuthentication.value ? SignInMode.Otp : SignInMode.Password);
  const showOtpEmailForm = computed(() => hasOtpEmailAuthentication.value && signInMode.value === SignInMode.Otp);

  const otpStep = ref(OtpStep.Request);
  const { resetErrors } = useAuth();

  function switchToOtp() {
    signInMode.value = SignInMode.Otp;
  }

  function switchToPassword() {
    resetErrors();
    signInMode.value = SignInMode.Password;
  }

  return {
    showOtpEmailForm,
    otpStep,
    switchToOtp,
    switchToPassword,
  };
}
