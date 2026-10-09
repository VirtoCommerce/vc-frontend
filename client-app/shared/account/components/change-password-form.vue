<template>
  <form class="change-password-form" @submit="onSubmit">
    <VcInput
      v-model="oldPassword"
      class="change-password-form__input"
      :label="$t('shared.account.change_password_form.current_pass_label')"
      :placeholder="$t('shared.account.change_password_form.current_pass_placeholder')"
      type="password"
      required
      :message="errors.oldPassword"
      :error="!!errors.oldPassword"
      autocomplete="off"
      :maxlength="MAX_PASS_LENGTH"
    />

    <VcInput
      v-model="newPassword"
      class="change-password-form__input"
      :label="$t('shared.account.change_password_form.new_pass_label')"
      :placeholder="$t('shared.account.change_password_form.new_pass_placeholder')"
      type="password"
      required
      :message="errors.newPassword"
      :error="!!errors.newPassword"
      autocomplete="off"
      :maxlength="MAX_PASS_LENGTH"
    />

    <VcInput
      v-model="confirmPassword"
      class="change-password-form__input"
      :label="$t('shared.account.change_password_form.confirm_new_pass_label')"
      :placeholder="$t('shared.account.change_password_form.confirm_new_pass_placeholder')"
      type="password"
      required
      :message="errors.confirmPassword"
      :error="!!errors.confirmPassword"
      autocomplete="off"
      :maxlength="MAX_PASS_LENGTH"
    />

    <PasswordTips v-if="passwordRequirements" :requirements="passwordRequirements" />

    <VcAlert v-for="error in result?.errors" :key="error.code" color="danger" class="change-password-form__error" icon>
      {{ translate(error) }}
    </VcAlert>

    <div class="change-password-form__actions">
      <VcButton :disabled="!meta.valid || meta.pending" :loading="loading" type="submit" min-width="12rem">
        {{ $t("common.buttons.change") }}
      </VcButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { useField, useForm } from "vee-validate";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { object, ref as yupRef, string } from "yup";
import { useErrorsTranslator } from "@/core/composables";
import { usePasswordRequirements, useUser } from "../composables";
import PasswordTips from "./password-tips.vue";
import type { IdentityResultType, IdentityErrorType } from "@/core/api/graphql/types";

interface IEmits {
  (event: "succeeded"): void;
}

const emit = defineEmits<IEmits>();

const MAX_PASS_LENGTH = 64;

const { t } = useI18n();
const { changePassword, loading, user } = useUser();
const { passwordRequirements } = usePasswordRequirements();
const { translate } = useErrorsTranslator<IdentityErrorType>("identity_error");

const validationSchema = toTypedSchema(
  object({
    oldPassword: string().required(),
    newPassword: string()
      .required()
      .when("oldPassword", {
        is: (value: string) => !!value,
        then: (stringSchema) =>
          stringSchema.required().notOneOf([yupRef("oldPassword")], t("common.messages.password_new_same_old")),
      }),
    confirmPassword: string()
      .required()
      .oneOf([yupRef("newPassword")], t("common.messages.passwords_do_not_match")),
  }),
);

const { errors, meta, handleSubmit, resetForm } = useForm({
  validationSchema,
  initialValues: {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  },
  validateOnMount: false,
});

const { value: oldPassword } = useField<string>("oldPassword");
const { value: newPassword } = useField<string>("newPassword");
const { value: confirmPassword } = useField<string>("confirmPassword");

const result = ref<IdentityResultType>();

const onSubmit = handleSubmit(async (data) => {
  result.value = await changePassword({
    userId: user.value.id,
    newPassword: data.newPassword,
    oldPassword: data.oldPassword,
  });

  if (result.value.succeeded) {
    resetForm();
    emit("succeeded");
  }
});
</script>

<style lang="scss">
.change-password-form {
  @apply w-full text-start;

  &__input {
    @apply mb-5;
  }

  &__error {
    @apply my-5 text-xs;
  }

  &__actions {
    @apply mt-5;

    @media (width < theme("screens.sm")) {
      @apply text-center;
    }
  }
}
</style>
