<template>
  <form @submit="onSubmit">
    <VcInput
      v-model="password"
      class="mb-4 w-full"
      :label="$t('common.labels.password')"
      :placeholder="$t('common.placeholders.password')"
      type="password"
      required
      :message="errors.password"
      :error="!!errors.password"
      autocomplete="new-password"
      :maxlength="64"
    />

    <VcInput
      v-model="confirmPassword"
      class="mb-4 w-full"
      :label="$t('common.labels.confirm_password')"
      :placeholder="$t('common.placeholders.confirm_password')"
      type="password"
      required
      :message="errors.confirmPassword"
      :error="!!errors.confirmPassword"
      autocomplete="off"
      :maxlength="64"
    />

    <div>
      <PasswordTips v-if="passwordRequirements" :requirements="passwordRequirements" />

      <VcAlert
        v-for="error in commonErrors"
        :key="error"
        class="my-5 text-xs"
        color="danger"
        size="sm"
        variant="solid-light"
        icon
      >
        {{ error }}
      </VcAlert>

      <VcButton type="submit" class="mt-6 w-full lg:w-52" :loading="loading" :disabled="!meta.valid || meta.pending">
        {{ $t(isResetMode ? "common.buttons.reset_password" : "common.buttons.save") }}
      </VcButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { useField, useForm } from "vee-validate";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { object, ref as yupRef, string } from "yup";
import { useIdentityErrorTranslator } from "@/core/composables";
import { usePasswordRequirements, useUser } from "../composables";
import PasswordTips from "./password-tips.vue";

interface IEmits {
  (event: "succeeded"): void;
}

interface IProps {
  userId: string;
  token: string;
  mode?: "set" | "reset";
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  mode: "reset",
});

const { t } = useI18n();
const { resetPassword, loading } = useUser();
const { passwordRequirements } = usePasswordRequirements();
const getIdentityErrorTranslation = useIdentityErrorTranslator();

const validationSchema = toTypedSchema(
  object({
    password: string().required(),
    confirmPassword: string()
      .required()
      .oneOf([yupRef("password")], t("common.messages.passwords_do_not_match")),
  }),
);

const { errors, meta, handleSubmit } = useForm({
  validationSchema,
  initialValues: {
    password: "",
    confirmPassword: "",
  },
  validateOnMount: false,
});

const { value: password } = useField<string>("password");
const { value: confirmPassword } = useField<string>("confirmPassword");

const commonErrors = ref<string[]>([]);

const isResetMode = computed(() => props.mode === "reset");

const onSubmit = handleSubmit(async (data) => {
  commonErrors.value = [];

  const result = await resetPassword({
    userId: props.userId,
    token: props.token,
    password: `${data.password}`,
  });

  if (result.succeeded) {
    emit("succeeded");
  } else if (result.errors?.length) {
    result.errors.forEach((error) => {
      const errorDescription = getIdentityErrorTranslation(error);

      if (errorDescription) {
        commonErrors.value.push(errorDescription);
      }
    });
  }
});
</script>
