<template>
  <form class="email-otp-request-form" @submit="onSubmit">
    <VcAlert
      v-if="errorMessage"
      class="email-otp-request-form__error"
      color="danger"
      size="sm"
      variant="outline-dark"
      icon
    >
      {{ errorMessage }}
    </VcAlert>

    <p class="email-otp-request-form__subtitle">
      {{ $t("shared.sign_in.email_otp_sign_in_form.request.subtitle") }}
    </p>

    <VcInput
      v-model.trim="email"
      name="email"
      type="email"
      class="email-otp-request-form__input"
      :label="$t('shared.sign_in.email_otp_sign_in_form.request.email_label')"
      :placeholder="$t('common.placeholders.email')"
      :disabled="loading"
      required
      :message="validationErrors.email"
      :error="!!validationErrors.email"
      autocomplete="email"
      test-id-input="email-otp-email-input"
    />

    <VcButton
      :loading="loading"
      type="submit"
      class="email-otp-request-form__submit"
      full-width
      data-test-id="email-otp-continue-button"
    >
      {{ $t("shared.sign_in.email_otp_sign_in_form.request.continue_button") }}
    </VcButton>
  </form>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { useField, useForm } from "vee-validate";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { object, string } from "yup";
import { Logger } from "@/core/utilities";
import { useOtpSignIn } from "@/shared/sign-in/composables/useOtpSignIn";
import type { IOtpRequestResponse } from "@/shared/sign-in/composables/useOtpSignIn";

const emit = defineEmits<{
  (e: "succeeded", payload: { email: string; result: IOtpRequestResponse }): void;
  (e: "disabled"): void;
}>();

const { t } = useI18n();

const schema = toTypedSchema(
  object({
    email: string().required().email(),
  }),
);

const { errors: validationErrors, handleSubmit } = useForm({ validationSchema: schema });
const { value: email } = useField<string>("email");

const { loading, requestCode } = useOtpSignIn();
const errorMessage = ref("");

const onSubmit = handleSubmit(async () => {
  errorMessage.value = "";

  try {
    const result = await requestCode(email.value);

    if (!result) {
      errorMessage.value = t("shared.sign_in.email_otp_sign_in_form.request.errors.generic");
      return;
    }

    if (result.outcome === "Disabled") {
      emit("disabled");
      return;
    }

    emit("succeeded", { email: email.value, result });
  } catch (err) {
    Logger.error("EmailOtpRequestForm", err);
    errorMessage.value = t("shared.sign_in.email_otp_sign_in_form.request.errors.generic");
  }
});
</script>

<style lang="scss">
.email-otp-request-form {
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
