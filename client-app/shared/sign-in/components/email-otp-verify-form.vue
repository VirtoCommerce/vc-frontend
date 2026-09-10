<template>
  <form class="email-otp-verify-form" @submit.prevent="onSubmit">
    <VcAlert
      v-for="error in signInErrors"
      :key="error.code"
      class="email-otp-verify-form__error"
      color="danger"
      size="sm"
      variant="outline-dark"
      icon
    >
      <span v-if="isLockoutError(error?.code)">
        {{ translate(error) }}
        <ContactAdministratorLink />.
      </span>

      <span v-else>
        {{ translate(error) }}
      </span>
    </VcAlert>

    <p class="email-otp-verify-form__subtitle">
      {{ $t("shared.sign_in.email_otp_sign_in_form.verify.subtitle", { email: props.maskedEmail }) }}
    </p>

    <label class="email-otp-verify-form__label" for="email-otp-code">
      {{ $t("shared.sign_in.email_otp_sign_in_form.verify.code_label") }}
    </label>

    <div
      class="email-otp-verify-form__field"
      :class="{
        'email-otp-verify-form__field--focused': isFocused,
        'email-otp-verify-form__field--error': !!errorMessage,
        'email-otp-verify-form__field--busy': loading,
      }"
    >
      <input
        id="email-otp-code"
        ref="codeInputRef"
        v-model="code"
        class="email-otp-verify-form__input"
        type="text"
        inputmode="numeric"
        autocomplete="one-time-code"
        pattern="[0-9]*"
        :aria-invalid="!!errorMessage"
        aria-describedby="email-otp-hint email-otp-message"
        data-test-id="email-otp-code-input"
        @input="onInput"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />

      <div class="email-otp-verify-form__cells" aria-hidden="true">
        <div
          v-for="index in CODE_LENGTH"
          :key="index"
          class="email-otp-verify-form__cell"
          :class="{
            'email-otp-verify-form__cell--active': isFocused && index - 1 === code.length && code.length < CODE_LENGTH,
          }"
        >
          {{ code[index - 1] }}
        </div>
      </div>
    </div>

    <div v-if="errorMessage" id="email-otp-message" class="email-otp-verify-form__message" role="alert">
      {{ errorMessage }}
    </div>

    <p id="email-otp-hint" class="email-otp-verify-form__hint">
      {{ $t("shared.sign_in.email_otp_sign_in_form.verify.paste_hint") }}
    </p>

    <VcButton
      :loading="loading"
      :disabled="!isCodeComplete"
      type="submit"
      class="email-otp-verify-form__submit"
      full-width
      data-test-id="email-otp-sign-in-button"
    >
      {{ $t("shared.sign_in.email_otp_sign_in_form.verify.submit_button") }}
    </VcButton>

    <div class="email-otp-verify-form__footer">
      <button
        type="button"
        class="email-otp-verify-form__link"
        :disabled="loading"
        data-test-id="email-otp-resend-button"
        @click="onResend"
      >
        {{ $t("shared.sign_in.email_otp_sign_in_form.verify.resend_button") }}
      </button>

      <button type="button" class="email-otp-verify-form__link" @click="emit('useDifferentEmail')">
        {{ $t("shared.sign_in.email_otp_sign_in_form.verify.use_different_email_link") }}
      </button>
    </div>

    <p class="sr-only" aria-live="polite">{{ liveMessage }}</p>
  </form>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useErrorsTranslator } from "@/core/composables";
import { isLockoutError, Logger } from "@/core/utilities";
import { ContactAdministratorLink } from "@/shared/common";
import { useOtpSignIn } from "@/shared/sign-in/composables/useOtpSignIn";
import type { IdentityErrorType } from "@/core/api/graphql/types";
import type { IOtpVerifyResponse } from "@/shared/sign-in/composables/useOtpSignIn";

const emit = defineEmits<{
  (e: "useDifferentEmail"): void;
  (e: "disabled"): void;
  (e: "locked", lockoutSecondsRemaining: number | undefined): void;
}>();

const props = defineProps<{
  email: string;
  maskedEmail: string;
}>();

const CODE_LENGTH = 6;

const { t } = useI18n();
const { translate } = useErrorsTranslator<IdentityErrorType>("shared.account.sign_in_form.errors");
const { loading, verifyCode, requestCode, signInErrors, resetSignInErrors } = useOtpSignIn();

const codeInputRef = ref<HTMLInputElement>();
const code = ref("");
const isFocused = ref(false);
const errorMessage = ref("");
const liveMessage = ref("");

const isCodeComplete = computed(() => code.value.length === CODE_LENGTH && /^\d+$/.test(code.value));

onMounted(() => {
  codeInputRef.value?.focus();
});

function onInput() {
  code.value = code.value.replace(/\D/g, "").slice(0, CODE_LENGTH);

  if (errorMessage.value) {
    errorMessage.value = "";
  }

  if (isCodeComplete.value && !loading.value) {
    void onSubmit();
  }
}

async function onSubmit() {
  if (!isCodeComplete.value || loading.value) {
    return;
  }

  resetSignInErrors();

  try {
    const result = await verifyCode(props.email, code.value);
    await handleOutcome(result);
  } catch (err) {
    Logger.error("EmailOtpVerifyForm", err);
    errorMessage.value = t("shared.sign_in.email_otp_sign_in_form.verify.errors.generic");
  }
}

async function handleOutcome(result: IOtpVerifyResponse | undefined): Promise<void> {
  switch (result?.outcome) {
    case "Success":
      return;
    case "Disabled":
      emit("disabled");
      return;
    case "Locked":
      emit("locked", result.lockoutSecondsRemaining);
      return;
    case "InvalidCode":
      errorMessage.value = t("shared.sign_in.email_otp_sign_in_form.verify.errors.invalid_code");
      await nextTick();
      codeInputRef.value?.focus();
      codeInputRef.value?.select();
      return;
    default:
      errorMessage.value = t("shared.sign_in.email_otp_sign_in_form.verify.errors.generic");
  }
}

async function onResend() {
  errorMessage.value = "";

  try {
    const result = await requestCode(props.email);

    if (result?.outcome === "Disabled") {
      emit("disabled");
      return;
    }

    if (result?.outcome !== "Sent") {
      errorMessage.value = t("shared.sign_in.email_otp_sign_in_form.verify.errors.generic");
      return;
    }

    code.value = "";
    liveMessage.value = "";
    await nextTick();
    liveMessage.value = t("shared.sign_in.email_otp_sign_in_form.verify.live_resent");
    await nextTick();
    codeInputRef.value?.focus();
  } catch (err) {
    Logger.error("EmailOtpVerifyForm.onResend", err);
    errorMessage.value = t("shared.sign_in.email_otp_sign_in_form.verify.errors.generic");
  }
}
</script>

<style lang="scss">
.email-otp-verify-form {
  @apply text-start;

  &__error {
    @apply mb-4;
  }

  &__subtitle {
    @apply mb-4 text-base text-neutral-600;
  }

  &__label {
    @apply mb-2 block text-sm font-medium text-neutral-900;
  }

  &__field {
    @apply relative mb-3 rounded-md;

    &:focus-within {
      @apply ring-1 ring-accent-700;
    }
  }

  &__input {
    position: absolute;
    inset: 0;
    z-index: 2;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    color: transparent;
    background: transparent;
    caret-color: transparent;
    border: 0;

    &:focus {
      outline: none;
    }

    // Browsers force selected text to be visible regardless of `color`, so a plain
    // color:transparent above still lets input.select() paint the raw digits on top of the cells.
    &::selection {
      color: transparent;
      background: transparent;
    }
  }

  &__cells {
    @apply grid grid-cols-6 gap-2;
  }

  &__cell {
    @apply flex h-14 items-center justify-center rounded-md border border-neutral-300 bg-additional-50 text-lg font-semibold tabular-nums;
  }

  &__field--focused &__cell--active {
    @apply border-accent-700 ring-1 ring-accent-700;
  }

  &__field--error &__cell {
    @apply border-danger-600;
  }

  &__field--busy &__cells {
    @apply opacity-60;
  }

  &__message {
    @apply mt-3 rounded-md border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-800;
  }

  &__hint {
    @apply mt-2 text-sm text-neutral-500;
  }

  &__submit {
    @apply mb-4 mt-6;
  }

  &__footer {
    @apply flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 pt-4;
  }

  &__link {
    @apply text-sm font-bold text-[--link-color];

    &:hover {
      @apply text-[--link-hover-color];
    }

    &:disabled {
      @apply cursor-not-allowed opacity-50;
    }
  }
}
</style>
