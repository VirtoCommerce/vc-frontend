<template>
  <form @submit="onSubmit">
    <div class="px-8 pb-8 pt-5">
      <VcInput
        v-model="oldPassword"
        class="mb-4 w-full"
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
        class="mb-4 w-full"
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
        class="mb-4 w-full"
        :label="$t('shared.account.change_password_form.confirm_new_pass_label')"
        :placeholder="$t('shared.account.change_password_form.confirm_new_pass_placeholder')"
        type="password"
        required
        :message="errors.confirmPassword"
        :error="!!errors.confirmPassword"
        autocomplete="off"
        :maxlength="MAX_PASS_LENGTH"
      />

      <VcAlert v-for="error in commonErrors" :key="error" color="danger" class="my-4 text-xs" icon>
        {{ error }}
      </VcAlert>

      <PasswordTips v-if="passwordRequirements" :requirements="passwordRequirements" />
    </div>
    <div class="flex justify-end gap-x-2 px-8 py-4.5">
      <VcButton class="w-28" size="sm" type="submit" :loading="loading" :disabled="!meta.valid || meta.pending">
        {{ $t("shared.account.change_password_form.submit_btn") }}
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
import { useIdentityErrorTranslator } from "@/core/composables";
import { usePasswordRequirements, useUser } from "../composables";
import PasswordTips from "./password-tips.vue";

interface IEmits {
  (event: "succeeded"): void;
}

const emit = defineEmits<IEmits>();

const MAX_PASS_LENGTH = 64;

const { t } = useI18n();
const { changeExpiredPassword, loading, user } = useUser();
const { passwordRequirements, fetchPasswordRequirements } = usePasswordRequirements();

const getIdentityErrorTranslation = useIdentityErrorTranslator();

const validationSchema = toTypedSchema(
  object({
    oldPassword: string().required(),
    newPassword: string().required(),
    confirmPassword: string()
      .required()
      .oneOf([yupRef("newPassword")], t("identity_error.PasswordMismatch")),
  })
);

const { errors, meta, handleSubmit } = useForm({
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

const commonErrors = ref<string[]>([]);

const onSubmit = handleSubmit(async (data) => {
  commonErrors.value = [];

  const result = await changeExpiredPassword({
    userId: user.value.id,
    newPassword: data.newPassword,
    oldPassword: data.oldPassword,
  });

  if (result.succeeded) {
    emit("succeeded");
  } else if (result.errors?.length) {
    result.errors.forEach((error) => {
      let errorDescription;
      if (error.code === "PasswordMismatch") {
        errorDescription = t("shared.account.change_password_form.wrong_current_pass");
      } else {
        errorDescription = getIdentityErrorTranslation(error);
      }

      if (errorDescription) {
        commonErrors.value.push(errorDescription);
      }
    });
  }
});

if (!passwordRequirements.value) {
  fetchPasswordRequirements();
}
</script>
