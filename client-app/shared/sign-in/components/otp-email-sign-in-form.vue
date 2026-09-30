<template>
  <div class="otp-email-sign-in-form">
    <OtpEmailRequestForm v-if="step === OtpStep.Request" @succeeded="onRequested" @disabled="step = OtpStep.Disabled" />

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
        {{ $t("shared.sign_in.otp_email_sign_in_form.locked.title") }}
      </h2>

      <p v-if="isIndefiniteLockout" class="otp-email-sign-in-form__terminal-text">
        {{ $t("common.messages.blocked") }} <ContactAdministratorLink />.
      </p>

      <p v-else-if="isLockoutTimeUnknown" class="otp-email-sign-in-form__terminal-text">
        {{ $t("shared.account.sign_in_form.errors.user_is_temporary_locked_out") }}
      </p>

      <p v-else class="otp-email-sign-in-form__terminal-text">
        {{
          lockoutCountdown.secondsLeft.value > 0
            ? $t("shared.sign_in.otp_email_sign_in_form.locked.text_countdown", {
                time: lockoutCountdown.formatted.value,
              })
            : $t("shared.sign_in.otp_email_sign_in_form.locked.text_ready")
        }}
      </p>

      <VcButton
        v-if="!isIndefiniteLockout"
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
        {{ $t("shared.sign_in.otp_email_sign_in_form.disabled.text") }}
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
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { useAuth } from "@/core/composables/useAuth";
import { ContactAdministratorLink } from "@/shared/common";
import { OtpStep } from "@/shared/sign-in/enums";
import OtpEmailRequestForm from "./otp-email-request-form.vue";
import OtpEmailVerifyForm from "./otp-email-verify-form.vue";
import type { IOtpRequestResponse } from "@/shared/sign-in/composables/useOtpSignIn";

const emit = defineEmits<{
  (e: "switchToPassword"): void;
  (e: "stepChanged", step: OtpStep): void;
}>();
defineProps<{
  hasPasswordAuthentication: boolean;
}>();
// A lockout this long isn't a real countdown a user should watch tick down (and the platform
// can report an effectively-infinite value for an admin-imposed lockout) — treat it as indefinite.
const MAX_COUNTDOWN_SECONDS = 7 * 24 * 60 * 60;

const step = ref(OtpStep.Request);
const terminalHeadingRef = ref<HTMLElement>();
const isIndefiniteLockout = ref(false);
const isLockoutTimeUnknown = ref(false);
const pending = ref<{
  email: string;
  maskedEmail: string;
}>();

function createCountdown() {
  const secondsLeft = ref(0);
  let deadline = 0;
  let timer: ReturnType<typeof setInterval> | undefined;

  const formatted = computed(() => {
    const minutes = Math.floor(secondsLeft.value / 60);
    const seconds = String(secondsLeft.value % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  });

  // Derived from a fixed deadline rather than decremented per tick, so a throttled
  // background tab (fewer ticks/sec) still shows the real time remaining, not a drifted one.
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
  async (value) => {
    emit("stepChanged", value);

    if (value !== OtpStep.Verify) {
      resetErrors();
    }

    if (value === OtpStep.Locked || value === OtpStep.Disabled) {
      await nextTick();
      terminalHeadingRef.value?.focus();
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

function onLocked(lockoutSecondsRemaining: number | undefined) {
  pending.value = undefined;

  const seconds = lockoutSecondsRemaining ?? 0;
  isLockoutTimeUnknown.value = lockoutSecondsRemaining === undefined;
  isIndefiniteLockout.value = seconds > MAX_COUNTDOWN_SECONDS;

  if (!isIndefiniteLockout.value) {
    lockoutCountdown.start(seconds);
  }

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
