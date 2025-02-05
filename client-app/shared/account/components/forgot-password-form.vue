<template>
  <form class="text-start" @submit="onSubmit">
    <VcInput
      v-model.trim="email"
      class="mb-4"
      :label="$t('common.labels.email')"
      :placeholder="$t('common.placeholders.email')"
      type="email"
      name="email"
      required
      :message="errors.email"
      :error="!!errors.email"
      :maxlength="64"
    />

    <div class="mt-8 md:mt-9">
      <VcAlert v-if="isError" color="danger" size="sm" variant="solid-light" class="mb-4 text-xs" icon>
        {{ $t("shared.account.forgot_password_form.error_alert") }}
        <ContactAdministratorLink />
      </VcAlert>

      <VcButton
        type="submit"
        class="mt-6 w-full lg:mt-3 lg:w-48"
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
