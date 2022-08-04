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
      :maxlength="64"
    ></VcInput>
    <div class="mt-8 md:mt-9">
      <VcAlert v-if="isError" type="error" class="mb-4 text-xs" icon text>
        <span v-html="$t('shared.account.forgot_password_form.error_alert')"></span>
      </VcAlert>

      <VcButton
        is-submit
        class="mt-6 lg:mt-3 w-full lg:w-48 uppercase"
        :is-waiting="loading"
        :is-disabled="hasFormErrors"
      >
        {{ $t("shared.account.forgot_password_form.submit_button") }}
      </VcButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { useUser } from "@/shared/account";
import { useI18n } from "vue-i18n";
import { isObjectEmpty } from "@/core/utilities";
import { useRouter } from "vue-router";

const { t } = useI18n();
const router = useRouter();

const { forgotPassword, loading } = useUser();

const emit = defineEmits(["succeeded"]);

const isError = ref(false);

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

const hasFormErrors = computed(() => !email.value || !isObjectEmpty(errors.value));

const commonErrors = ref<string[]>([]);

const onSubmit = handleSubmit(async (data) => {
  commonErrors.value = [];

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
