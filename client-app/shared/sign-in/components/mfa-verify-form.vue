<template>
  <SignInCodeForm
    ref="codeFormRef"
    id-prefix="mfa"
    :subtitle="$t('shared.sign_in.mfa_verify_form.subtitle', { destination })"
    :back-label="backLabel ?? $t('shared.sign_in.mfa_verify_form.back_link')"
    :loading="loading"
    :errors="signInErrors"
    :resend-available-at="resendAvailableAt"
    @submit="onSubmit"
    @resend="onResend"
    @clear-errors="resetSignInErrors"
    @back="emit('back')"
  />
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { IdentityErrors } from "@/core/enums";
import { useMfaSignIn } from "@/shared/sign-in/composables/useMfaSignIn";
import SignInCodeForm from "./sign-in-code-form.vue";
import type { IdentityErrorType } from "@/core/api/graphql/types";
import type { TwoFactorChallengeType } from "@/core/types";
import type { MfaResendResponseType } from "@/shared/sign-in/composables/useMfaSignIn";

interface IProps {
  email: string;
  challenge: TwoFactorChallengeType;
  onVerified: () => Promise<unknown>;
  backLabel?: string;
  trackAnalytics?: boolean;
}

interface IEmits {
  (event: "back"): void;
  (event: "failed", error: IdentityErrorType): void;
}

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  backLabel: undefined,
  trackAnalytics: true,
});

const { t } = useI18n();
const { loading, verifyCode, resendCode, signInErrors, resetSignInErrors, handleError } = useMfaSignIn();

const codeFormRef = useTemplateRef<InstanceType<typeof SignInCodeForm>>("codeFormRef");

const resent = ref<MfaResendResponseType>();
const resendAvailableAt = ref<number>();

const currentToken = computed(() => resent.value?.twoFactorToken ?? props.challenge.twoFactorToken);
const currentProvider = computed(() => resent.value?.provider ?? props.challenge.provider);
const currentProviders = computed(() => resent.value?.providers ?? props.challenge.providers ?? []);

const destination = computed(
  () => currentProviders.value.find((x) => x.name === currentProvider.value)?.destination ?? props.email,
);

watch(
  () => props.challenge.resendSecondsRemaining,
  (seconds) => {
    resendAvailableAt.value = toResendAvailableAt(seconds);
  },
  { immediate: true },
);

async function onSubmit(code: string) {
  resetSignInErrors();

  const result = await verifyCode(props.email, currentToken.value, code, {
    onVerified: props.onVerified,
    trackAnalytics: props.trackAnalytics,
  });

  if (result?.succeeded) {
    return;
  }

  handleError(result, emit);
  await codeFormRef.value?.reset();
}

function toResendAvailableAt(seconds?: number) {
  return seconds ? Date.now() + seconds * 1000 : undefined;
}

async function onResend() {
  const result = await resendCode(currentToken.value, currentProvider.value);

  if (result?.resendSecondsRemaining) {
    resendAvailableAt.value = toResendAvailableAt(result.resendSecondsRemaining);
  }

  if (result?.error?.code === IdentityErrors.RESEND_TOO_SOON) {
    return;
  }

  if (!result?.succeeded || !result.twoFactorToken) {
    handleError(result, emit);
    return;
  }

  resent.value = result;

  await codeFormRef.value?.reset(t("shared.sign_in.sign_in_code_form.live_resent"));
}
</script>
