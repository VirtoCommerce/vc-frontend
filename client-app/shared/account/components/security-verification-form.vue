<template>
  <div class="security-verification-form">
    <VcTypography tag="h1" class="security-verification-form__title">
      {{ $t("pages.account.impersonate.title") }}
    </VcTypography>

    <p class="security-verification-form__subtitle">
      {{ $t("pages.account.impersonate.subtitle") }}
    </p>

    <p class="security-verification-form__description">
      {{ $t("pages.account.impersonate.description") }}
    </p>

    <VcAlert
      v-if="step === 'success'"
      class="security-verification-form__success"
      color="success"
      variant="outline-dark"
      size="md"
      icon
    >
      {{ $t("pages.account.impersonate.success") }}
    </VcAlert>

    <form v-else class="security-verification-form__form" @submit="onSubmit">
      <VcAlert
        v-for="(message, index) in translatedErrors"
        :key="`${index}-${message}`"
        class="security-verification-form__error"
        color="danger"
        variant="outline-dark"
        size="sm"
        icon
      >
        {{ message }}
      </VcAlert>

      <VcInput
        v-model.trim="email"
        name="email"
        class="security-verification-form__field"
        type="email"
        :label="$t('pages.account.impersonate.email_label')"
        :placeholder="$t('pages.account.impersonate.email_placeholder')"
        :disabled="loading"
        :message="validationErrors.email"
        :error="!!validationErrors.email"
        autocomplete="email"
        required
      />

      <VcInput
        v-model="password"
        name="password"
        class="security-verification-form__field"
        type="password"
        :label="$t('pages.account.impersonate.password_label')"
        :placeholder="$t('pages.account.impersonate.password_placeholder')"
        :disabled="loading"
        :message="validationErrors.password"
        :error="!!validationErrors.password"
        autocomplete="current-password"
        required
      />

      <div class="security-verification-form__actions">
        <VcButton
          type="submit"
          class="security-verification-form__submit"
          :loading="loading"
          :disabled="!meta.valid"
          no-wrap
        >
          {{ $t("pages.account.impersonate.submit_button") }}
        </VcButton>

        <VcButton
          type="button"
          class="security-verification-form__cancel"
          variant="outline"
          :disabled="loading"
          no-wrap
          @click="onCancel"
        >
          {{ $t("pages.account.impersonate.cancel_button") }}
        </VcButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { useField, useForm } from "vee-validate";
import { computed, watch } from "vue";
import { object, string } from "yup";
import { useErrorsTranslator } from "@/core/composables";
import { useImpersonate } from "@/shared/account/composables";
import type { IdentityErrorType } from "@/core/api/graphql/types";

interface IEmits {
  (event: "success"): void;
  (event: "cancel"): void;
}

interface IProps {
  targetUserId: string;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const schema = toTypedSchema(
  object({
    email: string().required().email(),
    password: string().required(),
  }),
);

const {
  errors: validationErrors,
  meta,
  handleSubmit,
} = useForm({
  validationSchema: schema,
});

const { value: email } = useField<string>("email");
const { value: password } = useField<string>("password");

const { impersonate, loading, step, errors, resetState } = useImpersonate();

const { translate } = useErrorsTranslator<IdentityErrorType>([
  "pages.account.impersonate.errors",
  "shared.account.sign_in_form.errors",
]);

const translatedErrors = computed<string[]>(() => {
  const list = errors.value ?? [];
  return list
    .map((error) => translate(error))
    .filter((message): message is string => typeof message === "string" && message.length > 0);
});

const onSubmit = handleSubmit(async () => {
  await impersonate(email.value, password.value, props.targetUserId);

  if (step.value === "success") {
    emit("success");
  }
});

function onCancel(): void {
  emit("cancel");
}

watch([email, password], () => {
  if (errors.value.length > 0) {
    resetState();
  }
});
</script>

<style lang="scss">
.security-verification-form {
  @apply mx-auto flex w-full max-w-md flex-col text-start;

  &__title {
    @apply mb-2;
  }

  &__subtitle {
    @apply mb-2 text-base font-semibold text-neutral-900;
  }

  &__description {
    @apply mb-6 text-sm text-neutral-700;
  }

  &__success {
    @apply mb-4;
  }

  &__form {
    @apply flex flex-col;
  }

  &__error {
    @apply mb-4;
  }

  &__field {
    @apply mb-4;
  }

  &__actions {
    @apply mt-4 flex flex-col gap-3;

    @media (width >= theme("screens.sm")) {
      @apply flex-row;
    }
  }

  &__submit {
    @apply flex-1 shrink;
  }

  &__cancel {
    @apply flex-1;
  }
}
</style>
