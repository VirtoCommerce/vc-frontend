<template>
  <form @submit="onSubmit">
    <VcInput
      v-model="password"
      class="mb-4 w-full"
      :label="$t(`shared.account.${localizationFormTerm}.password_label`)"
      :placeholder="$t(`shared.account.${localizationFormTerm}.password_placeholder`)"
      type="password"
      is-required
      :error-message="errors.password"
      autocomplete="new-password"
      :maxlength="64"
    />

    <VcInput
      v-model="confirmPassword"
      class="mb-4 w-full"
      :label="$t(`shared.account.${localizationFormTerm}.confirm_password_label`)"
      :placeholder="$t(`shared.account.${localizationFormTerm}.confirm_password_placeholder`)"
      type="password"
      is-required
      :error-message="errors.confirmPassword"
      autocomplete="off"
      :maxlength="64"
    />

    <div>
      <VcAlert v-for="error in commonErrors" :key="error" type="danger" class="mb-4 text-xs" icon>
        {{ error }}
      </VcAlert>

      <VcButton
        size="lg"
        is-submit
        class="mt-6 w-full lg:w-52 uppercase"
        :is-waiting="loading"
        :is-disabled="!meta.valid || meta.pending"
      >
        {{ $t(`shared.account.${localizationFormTerm}.reset_password_button`) }}
      </VcButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, PropType, ref } from "vue";
import * as yup from "yup";
import { useField, useForm } from "vee-validate";
import { useI18n } from "vue-i18n";
import { useIdentityErrorTranslator } from "@/core/composables";
import { useUser } from "@/shared/account";

const emit = defineEmits(["succeeded"]);

const props = defineProps({
  kind: {
    type: String as PropType<"set" | "reset">,
    default: "reset",
  },
  userId: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
});

const { t } = useI18n();
const { resetPassword, loading } = useUser();
const getIdentityErrorTranslation = useIdentityErrorTranslator();

const schema = yup.object({
  password: yup.string().label(t("shared.account.reset_password_form.password_label")).required(),
  confirmPassword: yup
    .string()
    .label(t("shared.account.reset_password_form.confirm_password_label"))
    .required()
    .oneOf([yup.ref("password"), null], t("identity_error.PasswordMismatch")),
});

const { errors, meta, handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: {
    password: "",
    confirmPassword: "",
  },
  validateOnMount: false,
});

const { value: password } = useField<string>("password");
const { value: confirmPassword } = useField<string>("confirmPassword");

const commonErrors = ref<string[]>([]);

const localizationFormTerm = computed(() => (props.kind === "set" ? "set_password_form" : "reset_password_form"));

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
