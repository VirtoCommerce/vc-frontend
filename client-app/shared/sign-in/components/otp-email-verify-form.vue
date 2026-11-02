<template>
  <SignInCodeForm
    ref="codeFormRef"
    id-prefix="otp-email"
    :subtitle="$t('shared.sign_in.otp_email_sign_in_form.verify.subtitle', { email: props.maskedEmail })"
    :back-label="$t('shared.sign_in.otp_email_sign_in_form.verify.use_different_email_link')"
    :loading="loading"
    :errors="signInErrors"
    @submit="onSubmit"
    @resend="onResend"
    @clear-errors="resetSignInErrors"
    @back="emit('useDifferentEmail')"
  />
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import { useOtpSignIn } from "@/shared/sign-in/composables/useOtpSignIn";
import SignInCodeForm from "./sign-in-code-form.vue";
import type { IdentityErrorType } from "@/core/api/graphql/types";

interface IProps {
  email: string;
  maskedEmail: string;
}

interface IEmits {
  (event: "useDifferentEmail"): void;
  (event: "disabled"): void;
  (event: "locked", error: IdentityErrorType, lockoutSecondsRemaining: number | undefined): void;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const { t } = useI18n();
const { loading, verifyCode, requestCode, signInErrors, resetSignInErrors, handleError } = useOtpSignIn();

const codeFormRef = useTemplateRef<InstanceType<typeof SignInCodeForm>>("codeFormRef");

async function onSubmit(code: string) {
  resetSignInErrors();

  const result = await verifyCode(props.email, code);

  if (result?.succeeded) {
    return;
  }

  handleError(result, emit);
  await codeFormRef.value?.reset();
}

async function onResend() {
  const result = await requestCode(props.email);

  if (!result?.succeeded) {
    handleError(result, emit);
    return;
  }

  await codeFormRef.value?.reset(t("shared.sign_in.sign_in_code_form.live_resent"));
}
</script>
