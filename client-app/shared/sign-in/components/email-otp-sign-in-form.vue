<template>
  <div class="email-otp-sign-in-form">
    <EmailOtpRequestForm v-if="step === 'request'" @succeeded="onRequested" @disabled="step = 'generic'" />

    <EmailOtpVerifyForm
      v-else-if="step === 'verify' && pending"
      :email="pending.email"
      :masked-email="pending.maskedEmail"
      @use-different-email="resetToRequest"
      @disabled="step = 'generic'"
      @locked="onLocked"
    />

    <div v-else-if="step === 'locked'" class="email-otp-sign-in-form__terminal">
      <h2 ref="terminalHeadingRef" tabindex="-1" class="email-otp-sign-in-form__terminal-title">
        {{ $t("shared.sign_in.email_otp_sign_in_form.locked.title") }}
      </h2>

      <p v-if="isIndefiniteLockout" class="email-otp-sign-in-form__terminal-text">
        {{ $t("common.messages.blocked") }} <ContactAdministratorLink />.
      </p>

      <p v-else class="email-otp-sign-in-form__terminal-text">
        {{
          lockoutCountdown.secondsLeft.value > 0
            ? $t("shared.sign_in.email_otp_sign_in_form.locked.text_countdown", {
                time: lockoutCountdown.formatted.value,
              })
            : $t("shared.sign_in.email_otp_sign_in_form.locked.text_ready")
        }}
      </p>

      <VcButton
        v-if="!isIndefiniteLockout"
        full-width
        :disabled="lockoutCountdown.secondsLeft.value > 0"
        @click="resetToRequest"
      >
        {{ $t("shared.sign_in.email_otp_sign_in_form.locked.start_over_button") }}
      </VcButton>

      <div v-if="hasPasswordAuthentication" class="email-otp-sign-in-form__terminal-footer">
        <button
          type="button"
          class="email-otp-sign-in-form__link"
          data-test-id="email-otp-switch-to-password-link"
          @click="emit('switchToPassword')"
        >
          {{ $t("shared.sign_in.email_otp_sign_in_form.request.switch_to_password_link") }}
        </button>
      </div>
    </div>

    <div v-else-if="step === 'generic'" class="email-otp-sign-in-form__terminal">
      <h2 ref="terminalHeadingRef" tabindex="-1" class="email-otp-sign-in-form__terminal-title">
        {{ $t("shared.sign_in.email_otp_sign_in_form.generic.title") }}
      </h2>

      <p class="email-otp-sign-in-form__terminal-text">
        {{ $t("shared.sign_in.email_otp_sign_in_form.generic.text") }}
      </p>

      <VcButton
        v-if="hasPasswordAuthentication"
        full-width
        data-test-id="email-otp-switch-to-password-button"
        @click="emit('switchToPassword')"
      >
        {{ $t("shared.sign_in.email_otp_sign_in_form.generic.password_button") }}
      </VcButton>

      <div class="email-otp-sign-in-form__terminal-footer">
        <button type="button" class="email-otp-sign-in-form__link" @click="resetToRequest">
          {{ $t("shared.sign_in.email_otp_sign_in_form.generic.back_link") }}
        </button>
      </div>
    </div>

    <button
      v-if="step === 'request' && hasPasswordAuthentication"
      type="button"
      class="email-otp-sign-in-form__link email-otp-sign-in-form__switch-link"
      data-test-id="email-otp-switch-to-password-link"
      @click="emit('switchToPassword')"
    >
      {{ $t("shared.sign_in.email_otp_sign_in_form.request.switch_to_password_link") }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { ContactAdministratorLink } from "@/shared/common";
import EmailOtpRequestForm from "./email-otp-request-form.vue";
import EmailOtpVerifyForm from "./email-otp-verify-form.vue";
import type { IOtpRequestResponse } from "@/shared/sign-in/composables/useOtpSignIn";
import type { OtpStepType } from "@/shared/sign-in/composables/useOtpSignInMode";

const emit = defineEmits<{
  (e: "switchToPassword"): void;
  (e: "stepChanged", step: OtpStepType): void;
}>();
defineProps<{
  hasPasswordAuthentication: boolean;
}>();
const DEFAULT_LOCKOUT_SECONDS = 900;
// A lockout this long isn't a real countdown a user should watch tick down (and the platform
// can report an effectively-infinite value for an admin-imposed lockout) — treat it as indefinite.
const MAX_COUNTDOWN_SECONDS = 7 * 24 * 60 * 60;

const step = ref<OtpStepType>("request");
const terminalHeadingRef = ref<HTMLElement>();
const isIndefiniteLockout = ref(false);
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

onBeforeUnmount(() => {
  lockoutCountdown.stop();
});

watch(
  step,
  async (value) => {
    emit("stepChanged", value);

    if (value === "locked" || value === "generic") {
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
  step.value = "verify";
}

function onLocked(lockoutSecondsRemaining: number | undefined) {
  pending.value = undefined;

  const seconds = lockoutSecondsRemaining ?? DEFAULT_LOCKOUT_SECONDS;
  isIndefiniteLockout.value = seconds > MAX_COUNTDOWN_SECONDS;

  if (!isIndefiniteLockout.value) {
    lockoutCountdown.start(seconds);
  }

  step.value = "locked";
}

function resetToRequest() {
  pending.value = undefined;
  step.value = "request";
}
</script>

<style lang="scss">
.email-otp-sign-in-form {
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
