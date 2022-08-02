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
      <VcAlert v-for="error in commonErrors" :key="error" type="error" class="mb-4 text-xs" icon text>
        {{ error }}
      </VcAlert>

      <VcButton
        size="lg"
        is-submit
        class="mt-6 w-full lg:w-52 uppercase"
        :is-waiting="loading"
        :is-disabled="hasFormErrors"
      >
        {{ $t(`shared.account.${localizationFormTerm}.reset_password_button`) }}
      </VcButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, PropType, ref } from "vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { useUser } from "@/shared/account";
import { useI18n } from "vue-i18n";
import { isObjectEmpty } from "@/core/utilities";

const { resetPassword, loading } = useUser();

const { t } = useI18n();

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

const localizationFormTerm = computed(() => (props.kind == "set" ? "set_password_form" : "reset_password_form"));

const schema = yup.object({
  password: yup.string().label(t("shared.account.reset_password_form.password_label")).required(),
  confirmPassword: yup
    .string()
    .label(t("shared.account.reset_password_form.confirm_password_label"))
    .required()
    .oneOf([yup.ref("password"), null], t("shared.account.reset_password_form.password_must_match_message")),
});

const { errors, handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: {
    password: "",
    confirmPassword: "",
  },
  validateOnMount: false,
});

const { value: password } = useField<string>("password");
const { value: confirmPassword } = useField<string>("confirmPassword");

const hasFormErrors = computed(() => !password.value || !confirmPassword.value || !isObjectEmpty(errors.value));

const commonErrors = ref<string[]>([]);

const onSubmit = handleSubmit(async (data) => {
  commonErrors.value = [];

  const result = await resetPassword({
    userId: props.userId,
    token: props.token,
    password: `${data.password}`,
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
