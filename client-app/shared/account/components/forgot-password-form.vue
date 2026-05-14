<template>
  <form class="forgot-password-form" @submit="onSubmit">
    <VcInput
      v-model.trim="email"
      class="forgot-password-form__input"
      :label="$t('common.labels.email')"
      :placeholder="$t('common.placeholders.email')"
      type="email"
      name="email"
      required
      :message="errors.email"
      :error="!!errors.email"
      :maxlength="64"
    />

    <div class="forgot-password-form__actions">
      <VcAlert v-if="isError" color="danger" size="sm" variant="solid-light" class="forgot-password-form__error" icon>
        {{ $t("shared.account.forgot_password_form.error_alert") }}
        <ContactAdministratorLink />
      </VcAlert>

      <VcButton
        type="submit"
        class="forgot-password-form__submit"
        :loading="loading"
        :disabled="!meta.valid || meta.pending"
      >
        {{ $t("common.buttons.submit") }}
      </VcButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { useField, useForm } from "vee-validate";
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { object, string } from "yup";
import { ContactAdministratorLink } from "@/shared/common";
import { useUser } from "../composables";

interface IEmits {
  (event: "succeeded"): void;
}

const emit = defineEmits<IEmits>();

const router = useRouter();
const { forgotPassword, loading } = useUser();

const schema = toTypedSchema(
  object({
    email: string().required().email().max(64),
  }),
);

const { errors, meta, handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: {
    email: "",
  },
  validateOnMount: false,
});

const { value: email } = useField<string>("email");

const isError = ref(false);

const onSubmit = handleSubmit(async (data) => {
  const resetPasswordUrlPath = router.resolve({ name: "ResetPassword" }).path;

  const result = await forgotPassword({
    email: `${data.email}`,
    resetPasswordUrlPath,
  });

  if (result) {
    emit("succeeded");
  } else {
    isError.value = true;
  }
});

watch(email, () => {
  isError.value = false;
});
</script>

<style lang="scss">
.forgot-password-form {
  @apply text-start;

  &__input {
    @apply mb-4;
  }

  &__actions {
    @apply mt-8;

    @media (width >= theme("screens.md")) {
      @apply mt-9;
    }
  }

  &__error {
    @apply mb-4 text-xs;
  }

  &__submit {
    @apply mt-6 w-full;

    @media (width >= theme("screens.lg")) {
      @apply mt-3 w-48;
    }
  }
}
</style>
