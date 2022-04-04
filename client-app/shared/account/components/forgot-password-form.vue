<template>
  <form @submit="onSubmit">
    <VcInput
      v-model="email"
      class="mb-4"
      :label="$t('shared.account.forgot_password_form.email_label')"
      :placeholder="$t('shared.account.forgot_password_form.email_placeholder')"
      type="email"
      is-required
      :error-message="errors.email"
    ></VcInput>
    <div class="mt-8 md:mt-9">
      <VcAlert v-for="error in commonErrors" :key="error" type="error" class="mb-4 text-xs" icon text>
        {{ error }}
      </VcAlert>

      <VcButton is-submit class="mt-6 lg:mt-3 w-full lg:w-48 uppercase" :is-waiting="loading">
        {{ $t("shared.account.forgot_password_form.submit_button") }}
      </VcButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { VcAlert, VcInput, VcButton } from "@/components";
import { ref } from "vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { useUser } from "@/shared/account";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const { forgotPassword, loading } = useUser();

const emit = defineEmits(["succeeded"]);

const schema = yup.object({
  email: yup
    .string()
    .label(t("shared.account.forgot_password_form.email_label"))
    .required()
    .email(t("shared.account.forgot_password_form.invalid_email_format_message"))
    .max(64),
});

const { errors, handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: {
    email: "",
  },
  validateOnMount: false,
});

const { value: email } = useField<string>("email");

const commonErrors = ref<string[]>([]);

const onSubmit = handleSubmit(async (data) => {
  commonErrors.value = [];

  const resetPasswordUrl = location.origin + "/reset-password";

  const result = await forgotPassword({
    email: `${data.email}`,
    resetPasswordUrl,
  });

  if (result.succeeded) {
    emit("succeeded");
  } else {
    if (result.errors?.length) {
      commonErrors.value = result.errors.map((x) => x?.description as string);
    }
  }
});
</script>
