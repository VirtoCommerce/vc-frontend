<template>
  <div class="otp-email-sign-in-form">
    <OtpEmailRequestForm
      v-if="step === OtpStep.Request"
      ref="requestForm"
      @succeeded="onRequested"
      @disabled="step = OtpStep.Disabled"
    />

    <OtpEmailVerifyForm
      v-else-if="step === OtpStep.Verify && pending"
      :email="pending.email"
      :masked-email="pending.maskedEmail"
      @use-different-email="resetToRequest"
      @disabled="step = OtpStep.Disabled"
      @locked="onLocked"
    />

    <div v-else-if="step === OtpStep.Locked" class="otp-email-sign-in-form__terminal">
      <h2 ref="terminalHeadingRef" tabindex="-1" class="otp-email-sign-in-form__terminal-title">
        {{
          isPermanentLockout
            ? $t("shared.sign_in.otp_email_sign_in_form.locked.title_blocked")
            : $t("shared.sign_in.otp_email_sign_in_form.locked.title")
        }}
      </h2>

      <p class="otp-email-sign-in-form__terminal-text">
        {{ lockoutError && translate(lockoutError) }}
        <template v-if="isPermanentLockout"> <ContactAdministratorLink />. </template>
      </p>

      <p v-if="hasLockoutTimer" class="otp-email-sign-in-form__terminal-text">
        {{
          lockoutCountdown.secondsLeft.value > 0
            ? $t("shared.sign_in.otp_email_sign_in_form.locked.text_countdown", {
                time: lockoutCountdown.formatted.value,
              })
            : $t("shared.sign_in.otp_email_sign_in_form.locked.text_ready")
        }}
      </p>

      <VcButton
        v-if="!isPermanentLockout"
        full-width
        :disabled="lockoutCountdown.secondsLeft.value > 0"
        @click="resetToRequest"
      >
        {{ $t("shared.sign_in.otp_email_sign_in_form.locked.start_over_button") }}
      </VcButton>

      <div v-if="hasPasswordAuthentication" class="otp-email-sign-in-form__terminal-footer">
        <button
          type="button"
          class="otp-email-sign-in-form__link"
          data-test-id="otp-email-switch-to-password-link"
          @click="emit('switchToPassword')"
        >
          {{ $t("shared.sign_in.otp_email_sign_in_form.request.switch_to_password_link") }}
        </button>
      </div>
    </div>

    <div v-else-if="step === OtpStep.Disabled" class="otp-email-sign-in-form__terminal">
      <h2 ref="terminalHeadingRef" tabindex="-1" class="otp-email-sign-in-form__terminal-title">
        {{ $t("shared.sign_in.otp_email_sign_in_form.disabled.title") }}
      </h2>

      <p class="otp-email-sign-in-form__terminal-text">
        {{
          hasPasswordAuthentication
            ? $t("shared.sign_in.otp_email_sign_in_form.disabled.text")
            : $t("shared.sign_in.otp_email_sign_in_form.disabled.text_no_password")
        }}
      </p>

      <VcButton
        v-if="hasPasswordAuthentication"
        full-width
        data-test-id="otp-email-switch-to-password-button"
        @click="emit('switchToPassword')"
      >
        {{ $t("shared.sign_in.otp_email_sign_in_form.disabled.password_button") }}
      </VcButton>

      <div class="otp-email-sign-in-form__terminal-footer">
        <button type="button" class="otp-email-sign-in-form__link" @click="resetToRequest">
          {{ $t("shared.sign_in.otp_email_sign_in_form.disabled.back_link") }}
        </button>
      </div>
    </div>

    <button
      v-if="step === OtpStep.Request && hasPasswordAuthentication"
      type="button"
      class="otp-email-sign-in-form__link otp-email-sign-in-form__switch-link"
      data-test-id="otp-email-switch-to-password-link"
      @click="emit('switchToPassword')"
    >
      {{ $t("shared.sign_in.otp_email_sign_in_form.request.switch_to_password_link") }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useAuth } from "@/core/composables/useAuth";
import { useErrorsTranslator } from "@/core/composables/useErrorsTranslator";
import { isLockoutError } from "@/core/utilities";
import { ContactAdministratorLink } from "@/shared/common";
import { OtpStep } from "@/shared/sign-in/enums";
import OtpEmailRequestForm from "./otp-email-request-form.vue";
import OtpEmailVerifyForm from "./otp-email-verify-form.vue";
import type { IdentityErrorType } from "@/core/api/graphql/types";
import type { IOtpRequestResponse } from "@/shared/sign-in/composables/useOtpSignIn";

interface IProps {
  hasPasswordAuthentication: boolean;
}

interface IEmits {
  (event: "switchToPassword"): void;
  (event: "stepChanged", step: OtpStep): void;
}

defineProps<IProps>();
const emit = defineEmits<IEmits>();

const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;

const { locale } = useI18n();
const { translate } = useErrorsTranslator<IdentityErrorType>("shared.account.sign_in_form.errors");

const step = ref(OtpStep.Request);
const terminalHeadingRef = ref<HTMLElement>();
const requestForm = useTemplateRef<InstanceType<typeof OtpEmailRequestForm>>("requestForm");
const lockoutError = ref<IdentityErrorType>();
const isPermanentLockout = computed(() => isLockoutError(lockoutError.value?.code));
const hasLockoutTimer = ref(false);
const pending = ref<{
  email: string;
  maskedEmail: string;
}>();

function formatUnit(value: number, unit: "hour" | "minute" | "second") {
  return new Intl.NumberFormat(locale.value, { style: "unit", unit, unitDisplay: "narrow" }).format(value);
}

function createCountdown() {
  const secondsLeft = ref(0);
  let deadline = 0;
  let timer: ReturnType<typeof setInterval> | undefined;

  const formatted = computed(() => {
    if (secondsLeft.value < SECONDS_PER_MINUTE) {
      return formatUnit(secondsLeft.value, "second");
    }

    const totalMinutes = Math.ceil(secondsLeft.value / SECONDS_PER_MINUTE);
    const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
    const minutes = totalMinutes % MINUTES_PER_HOUR;

    return [hours && formatUnit(hours, "hour"), minutes && formatUnit(minutes, "minute")].filter(Boolean).join(" ");
  });

  function tick() {
    secondsLeft.value = Math.max(0, Math.round((deadline - Date.now()) / 1000));

    if (secondsLeft.value <= 0) {
      clearInterval(timer);
    }
  }

  function start(seconds: number) {
    clearInterval(timer);
    deadline = Date.now() + Math.max(0, seconds) * 1000;
    tick();
    timer = setInterval(tick, 1000);
  }

  function stop() {
    clearInterval(timer);
  }

  return { secondsLeft, formatted, start, stop };
}

const lockoutCountdown = createCountdown();
const { resetErrors } = useAuth();

onBeforeUnmount(() => {
  lockoutCountdown.stop();
});

watch(
  step,
  async (value, previous) => {
    emit("stepChanged", value);

    if (value !== OtpStep.Verify) {
      resetErrors();
    }

    if (value === OtpStep.Locked || value === OtpStep.Disabled) {
      await nextTick();
      terminalHeadingRef.value?.focus();
    }

    if (value === OtpStep.Request && previous) {
      await nextTick();
      requestForm.value?.focus();
    }
  },
  { immediate: true },
);

function onRequested({ email, result }: { email: string; result: IOtpRequestResponse }) {
  pending.value = {
    email,
    maskedEmail: result.maskedEmail ?? email,
  };
  step.value = OtpStep.Verify;
}

function onLocked(error: IdentityErrorType, lockoutSecondsRemaining: number | undefined) {
  pending.value = undefined;
  lockoutError.value = error;
  hasLockoutTimer.value = !isPermanentLockout.value && lockoutSecondsRemaining !== undefined;
  lockoutCountdown.start(hasLockoutTimer.value ? (lockoutSecondsRemaining ?? 0) : 0);
  step.value = OtpStep.Locked;
}

function resetToRequest() {
  pending.value = undefined;
  step.value = OtpStep.Request;
}
</script>

<style lang="scss">
.otp-email-sign-in-form {
  @apply text-start;

  &__switch-link {
    @apply mt-6 block;
  }

  &__link {
    @apply text-sm font-bold text-[--link-color];

    &:hover {
      @apply text-[--link-hover-color];
    }
  }

  &__terminal {
    @apply text-start;
  }

  &__terminal-title {
    @apply mb-2 text-lg font-semibold text-neutral-900;

    &:focus {
      @apply outline-none;
    }
  }

  &__terminal-text {
    @apply mb-5 text-base text-neutral-600;
  }

  &__terminal-footer {
    @apply mt-4 border-t border-neutral-200 pt-4;
  }
}
</style>
