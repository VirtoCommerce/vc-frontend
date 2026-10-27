<template>
  <form class="sign-in-code-form" @submit.prevent="onSubmit">
    <p class="sign-in-code-form__subtitle" :data-test-id="`${idPrefix}-subtitle`">
      {{ subtitle }}
    </p>

    <label class="sign-in-code-form__label" :for="inputId">
      {{ $t("shared.sign_in.sign_in_code_form.code_label") }}
    </label>

    <SignInCodeInput
      ref="codeInputRef"
      v-model="code"
      :input-id="inputId"
      :test-id="`${idPrefix}-code-input`"
      :length="CODE_LENGTH"
      :error="hasError"
      :busy="loading"
      :described-by="hasError ? `${errorId} ${hintId}` : hintId"
      @update:model-value="onCodeChange"
    />

    <div :id="errorId" role="alert">
      <VcAlert
        v-for="error in errors"
        :key="error.code"
        class="sign-in-code-form__error"
        color="danger"
        size="sm"
        variant="tonal"
        icon
        :data-test-id="`${idPrefix}-error-alert`"
      >
        <span v-if="isLockoutError(error?.code)">
          {{ translate(error) }}
          <ContactAdministratorLink />.
        </span>

        <span v-else>
          {{ translate(error) }}
        </span>
      </VcAlert>
    </div>

    <p :id="hintId" class="sign-in-code-form__hint">
      {{ $t("shared.sign_in.sign_in_code_form.paste_hint") }}
    </p>

    <p v-if="liveMessage" class="sign-in-code-form__notice" aria-hidden="true" :data-test-id="`${idPrefix}-notice`">
      {{ liveMessage }}
    </p>

    <VcButton
      :loading="loading"
      :disabled="!isCodeComplete"
      type="submit"
      class="sign-in-code-form__submit"
      full-width
      :data-test-id="`${idPrefix}-sign-in-button`"
    >
      {{ $t("shared.sign_in.sign_in_code_form.submit_button") }}
    </VcButton>

    <div class="sign-in-code-form__footer">
      <button
        type="button"
        class="sign-in-code-form__link"
        :disabled="loading || resendSecondsLeft > 0"
        :data-test-id="`${idPrefix}-resend-button`"
        @click="emit('resend')"
      >
        <template v-if="resendSecondsLeft > 0">
          {{ $t("shared.sign_in.sign_in_code_form.resend_countdown", { seconds: resendSecondsLeft }) }}
        </template>

        <template v-else>
          {{ $t("shared.sign_in.sign_in_code_form.resend_button") }}
        </template>
      </button>

      <button
        type="button"
        class="sign-in-code-form__link"
        :disabled="loading"
        :data-test-id="`${idPrefix}-back-button`"
        @click="emit('back')"
      >
        {{ backLabel }}
      </button>
    </div>

    <p class="sr-only" aria-live="polite">{{ liveMessage }}</p>
  </form>
</template>

<script setup lang="ts">
import { useNow } from "@vueuse/core";
import { computed, nextTick, onMounted, ref, useTemplateRef } from "vue";
import { useErrorsTranslator } from "@/core/composables";
import { isLockoutError } from "@/core/utilities";
import { ContactAdministratorLink } from "@/shared/common";
import SignInCodeInput from "./sign-in-code-input.vue";
import type { IdentityErrorType } from "@/core/api/graphql/types";

interface IProps {
  idPrefix: string;
  subtitle: string;
  backLabel: string;
  loading?: boolean;
  errors?: IdentityErrorType[];
  resendAvailableAt?: number;
}

interface IEmits {
  (event: "submit", code: string): void;
  (event: "resend"): void;
  (event: "clearErrors"): void;
  (event: "back"): void;
}

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  loading: false,
  errors: undefined,
  resendAvailableAt: undefined,
});

const CODE_LENGTH = 6;

const { translate } = useErrorsTranslator<IdentityErrorType>("shared.account.sign_in_form.errors");

const codeInputRef = useTemplateRef<InstanceType<typeof SignInCodeInput>>("codeInputRef");
const code = ref("");
const liveMessage = ref("");

const inputId = computed(() => `${props.idPrefix}-code`);
const errorId = computed(() => `${props.idPrefix}-code-error`);
const hintId = computed(() => `${props.idPrefix}-hint`);

const isCodeComplete = computed(() => isComplete(code.value));
const hasError = computed(() => !!props.errors?.length);

const now = useNow({ interval: 1000 });
const resendSecondsLeft = computed(() =>
  Math.max(0, Math.ceil(((props.resendAvailableAt ?? 0) - now.value.getTime()) / 1000)),
);

onMounted(() => {
  codeInputRef.value?.focus();
});

function isComplete(value: string) {
  return value.length === CODE_LENGTH;
}

function onCodeChange(value: string) {
  if (hasError.value) {
    emit("clearErrors");
  }

  submit(value);
}

function onSubmit() {
  submit(code.value);
}

function submit(value: string) {
  if (isComplete(value) && !props.loading) {
    emit("submit", value);
  }
}

async function reset(message?: string) {
  code.value = "";
  liveMessage.value = "";
  await nextTick();

  if (message) {
    liveMessage.value = message;
    await nextTick();
  }

  codeInputRef.value?.focus();
}

defineExpose({ reset });
</script>

<style lang="scss">
.sign-in-code-form {
  @apply text-start;

  &__error {
    @apply mb-2;
  }

  &__subtitle {
    @apply mb-4 text-base text-neutral-600;
  }

  &__label {
    @apply mb-2 block text-sm font-medium text-neutral-900;
  }

  &__hint {
    @apply mt-2 text-sm text-neutral-500;
  }

  &__notice {
    @apply mt-2 text-sm font-medium text-success-700;
  }

  &__submit {
    @apply mb-4 mt-6;
  }

  &__footer {
    @apply flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 pt-4;
  }

  &__link {
    @apply inline-flex min-h-6 items-center text-sm font-bold text-[--link-color];

    &:hover {
      @apply text-[--link-hover-color];
    }

    &:disabled {
      @apply cursor-not-allowed opacity-50;
    }
  }
}
</style>
