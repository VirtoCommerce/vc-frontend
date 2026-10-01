<template>
  <form class="otp-email-request-form" @submit="onSubmit">
    <div role="alert">
      <VcAlert
        v-for="error in signInErrors"
        :key="error.code"
        class="otp-email-request-form__error"
        color="danger"
        size="sm"
        variant="tonal"
        icon
      >
        {{ translate(error) }}
      </VcAlert>
    </div>

    <p class="otp-email-request-form__subtitle">
      {{ $t("shared.sign_in.otp_email_sign_in_form.request.subtitle") }}
    </p>

    <VcInput
      ref="emailInput"
      v-model.trim="email"
      name="email"
      type="email"
      class="otp-email-request-form__input"
      :label="$t('shared.sign_in.otp_email_sign_in_form.request.email_label')"
      :placeholder="$t('common.placeholders.email')"
      :disabled="loading"
      required
      :message="validationErrors.email"
      :error="!!validationErrors.email"
      autocomplete="email"
      test-id-input="otp-email-email-input"
    />

    <VcButton
      :loading="loading"
      type="submit"
      class="otp-email-request-form__submit"
      full-width
      data-test-id="otp-email-continue-button"
    >
      {{ $t("shared.sign_in.otp_email_sign_in_form.request.continue_button") }}
    </VcButton>
  </form>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { useTemplateRef } from "vue";
import { useField, useForm } from "vee-validate";
import { object, string } from "yup";
import { useErrorsTranslator } from "@/core/composables";
import { IdentityErrors } from "@/core/enums";
import { useOtpSignIn } from "@/shared/sign-in/composables/useOtpSignIn";
import type { IdentityErrorType } from "@/core/api/graphql/types";
import type { IOtpRequestResponse } from "@/shared/sign-in/composables/useOtpSignIn";

interface IEmits {
  (event: "succeeded", payload: { email: string; result: IOtpRequestResponse }): void;
  (event: "disabled"): void;
}

const emit = defineEmits<IEmits>();

const { translate } = useErrorsTranslator<IdentityErrorType>("shared.account.sign_in_form.errors");

const EMAIL_MAX_LENGTH = 254;

const schema = toTypedSchema(
  object({
    email: string().required().email().max(EMAIL_MAX_LENGTH),
  }),
);

const { errors: validationErrors, handleSubmit } = useForm({ validationSchema: schema });
const { value: email } = useField<string>("email");

const { loading, requestCode, signInErrors, showError } = useOtpSignIn();

const emailInput = useTemplateRef<{ inputElement: HTMLInputElement | null }>("emailInput");

function focus() {
  emailInput.value?.inputElement?.focus();
}

defineExpose({ focus });

const onSubmit = handleSubmit(async () => {
  const result = await requestCode(email.value);

  if (result?.error?.code === IdentityErrors.OTP_DISABLED) {
    emit("disabled");
    return;
  }

  if (!result?.succeeded) {
    showError(result?.error);
    return;
  }

  emit("succeeded", { email: email.value, result });
});
</script>

<style lang="scss">
.otp-email-request-form {
  @apply text-start;

  &__error {
    @apply mb-4;
  }

  &__subtitle {
    @apply mb-4 text-base text-neutral-600;
  }

  &__input {
    @apply mb-6;
  }
}
</style>
