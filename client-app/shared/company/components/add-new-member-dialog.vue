<template>
  <VcPopup :title="$t('shared.company.add_new_member_dialog.title')" modal-width="sm:max-w-md" is-mobile-fullscreen>
    <template #actions="{ close }">
      <VcButton
        class="w-1/2 lg:w-auto uppercase flex-grow lg:flex-grow-0 inline-flex lg:px-5"
        kind="secondary"
        is-outline
        @click="close"
      >
        {{ $t("shared.company.add_new_member_dialog.cancel_button") }}
      </VcButton>

      <VcButton
        class="w-1/2 lg:w-auto uppercase flex-grow lg:flex-grow-0 inline-flex lg:px-10"
        :is-disabled="!meta.dirty || !meta.valid"
        @click="
          onSubmit();
          close();
        "
      >
        {{ $t("shared.company.add_new_member_dialog.add_button") }}
      </VcButton>
    </template>

    <form class="px-5 py-4">
      <VcSelect
        v-model="role"
        class="mb-4"
        value-field="id"
        text-field="name"
        :error-message="errors.role"
        :items="ROLES"
        :label="$t('shared.company.add_new_member_dialog.role_label')"
        :placeholder="$t('shared.company.add_new_member_dialog.role_placeholder')"
        is-required
      />

      <VcInput
        v-model="firstName"
        class="mb-4"
        :label="$t('shared.company.add_new_member_dialog.first_name_label')"
        :placeholder="$t('shared.company.add_new_member_dialog.first_name_placeholder')"
        is-required
        :error-message="errors.firstName"
        :maxlength="64"
      ></VcInput>
      <VcInput
        v-model="lastName"
        class="mb-4"
        :label="$t('shared.company.add_new_member_dialog.last_name_label')"
        :placeholder="$t('shared.company.add_new_member_dialog.last_name_placeholder')"
        is-required
        :error-message="errors.lastName"
        :maxlength="64"
      ></VcInput>
      <VcInput
        v-model="email"
        class="mb-4"
        :label="$t('shared.company.add_new_member_dialog.email_label')"
        :placeholder="$t('shared.company.add_new_member_dialog.email_placeholder')"
        is-required
        :error-message="errors.email"
        :maxlength="64"
      ></VcInput>
    </form>
  </VcPopup>
</template>

<script setup lang="ts">
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { usePageHead } from "@/core/composables";
import { checkEmailUniqueness, checkUsernameUniqueness } from "@/xapi/graphql/account";
import { useI18n } from "vue-i18n";
import _ from "lodash";
import { AddNewMember } from "@/shared/company";
import { ROLES } from "@/core/securityConstants";

const { t } = useI18n();

//const roles = ["org-maintainer", "org-employee", "purchasing-agent"];

const ASYNC_VALIDATION_TIMEOUT_IN_MS = 3000;

usePageHead({
  title: t("pages.sign_up.meta.title"),
});

defineProps({
  onResult: {
    type: Function,
    default: undefined,
  },
});

//const emit = defineEmits(["result"]);
const emit = defineEmits<{ (e: "result", newMember: AddNewMember): void }>();

const schema = yup.object({
  role: yup.string().label(t("shared.company.add_new_member_dialog.role_label")).required(),
  email: yup
    .string()
    .label(t("shared.company.add_new_member_dialog.email_label"))
    .required()
    .email()
    .max(64)
    .test(
      "is-unique-email",
      t("pages.sign_up.errors.email_not_unique"),
      (value) => new Promise((resolve) => emailValidationDebounced(value!, resolve))
    ),
  firstName: yup.string().label(t("shared.company.add_new_member_dialog.first_name_label")).required().max(64),
  lastName: yup.string().label(t("shared.company.add_new_member_dialog.last_name_label")).required().max(64),
});

const { errors, handleSubmit, meta } = useForm({
  validationSchema: schema,
  initialValues: {
    role: undefined,
    email: "",
    firstName: "",
    lastName: "",
  },
  validateOnMount: false,
});

const { value: role } = useField<string>("role");
const { value: firstName } = useField<string>("firstName");
const { value: lastName } = useField<string>("lastName");
const { value: email } = useField<string>("email");

const onSubmit = handleSubmit((data) => {
  emit("result", {
    role: data.role as string,
    email: data.email as string,
    firstName: data.firstName as string,
    lastName: data.lastName as string,
  });
});

const validateEmailUniqueness = async (value: string, resolve: (value: boolean) => void) => {
  try {
    const responses = await Promise.all([
      checkEmailUniqueness({ email: value }),
      checkUsernameUniqueness({ username: value }),
    ]);

    resolve(responses[0] && responses[1]);
  } catch (error) {
    resolve(false);
  }
};

const emailValidationDebounced = _.debounce(validateEmailUniqueness, ASYNC_VALIDATION_TIMEOUT_IN_MS);
</script>
