import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuth } from "@/core/composables/useAuth";
import { OtpStep, PasswordStep, SignInMode } from "@/shared/sign-in/enums";
import type { ComputedRef, Ref } from "vue";

export function useOtpSignInMode(hasOtpEmailAuthentication: Ref<boolean> | ComputedRef<boolean>) {
  const { t } = useI18n();

  const signInMode = ref(hasOtpEmailAuthentication.value ? SignInMode.Otp : SignInMode.Password);
  const showOtpEmailForm = computed(() => hasOtpEmailAuthentication.value && signInMode.value === SignInMode.Otp);

  const otpStep = ref(OtpStep.Request);
  const passwordStep = ref(PasswordStep.Password);
  const showSwitchToOtpLink = computed(
    () => hasOtpEmailAuthentication.value && passwordStep.value === PasswordStep.Password,
  );

  const stepHeader = computed(() => {
    if (showOtpEmailForm.value) {
      return otpStep.value === OtpStep.Verify ? t("shared.sign_in.otp_email_sign_in_form.verify.header") : undefined;
    }

    return passwordStep.value === PasswordStep.TwoFactor ? t("shared.sign_in.mfa_verify_form.header") : undefined;
  });

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
    showSwitchToOtpLink,
    otpStep,
    passwordStep,
    stepHeader,
    switchToOtp,
    switchToPassword,
  };
}
