<template>
  <VcPopup :title="$t('shared.company.add_new_member_dialog.title')" is-mobile-fullscreen>
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
        :is-disabled="meta.dirty || !meta.valid"
        @click="
          onSubmit;
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
        text-field="role"
        :error-message="errors.role"
        :items="roles"
        label="Roles"
        placeholder="Select role"
        is-required
      />

      <VcInput
        v-model="firstName"
        class="mb-4"
        :label="$t('pages.sign_up.first_name_label')"
        :placeholder="$t('pages.sign_up.first_name_placeholder')"
        is-required
        :error-message="errors.firstName"
        :maxlength="64"
      ></VcInput>
      <VcInput
        v-model="lastName"
        class="mb-4"
        :label="$t('pages.sign_up.last_name_label')"
        :placeholder="$t('pages.sign_up.last_name_placeholder')"
        is-required
        :error-message="errors.lastName"
        :maxlength="64"
      ></VcInput>
      <VcInput
        v-model="email"
        class="mb-4"
        :label="$t('pages.sign_up.email_label')"
        :placeholder="$t('pages.sign_up.email_placeholder')"
        is-required
        :error-message="errors.email"
        :maxlength="64"
      ></VcInput>
    </form>
  </VcPopup>
</template>

<script setup lang="ts">
//import { computed, ref } from "vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { usePageHead } from "@/core/composables";
import { checkEmailUniqueness, checkUsernameUniqueness } from "@/xapi/graphql/account";
import { useI18n } from "vue-i18n";
import _ from "lodash";

const { t } = useI18n();

const roles = ["org-maintainer", "org-employee", "purchasing-agent"];
const ASYNC_VALIDATION_TIMEOUT_IN_MS = 3000;

usePageHead({
  title: t("pages.sign_up.meta.title"),
});

const schema = yup.object({
  role: yup.string().label("Role").required(),
  email: yup
    .string()
    .label("Email")
    .required()
    .email()
    .max(64)
    .test(
      "is-unique-email",
      t("pages.sign_up.errors.email_not_unique"),
      (value) => new Promise((resolve) => emailValidationDebounced(value!, resolve))
    ),
  firstName: yup.string().label("First Name").required().max(64),
  lastName: yup.string().label("Last Name").required().max(64),
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

const onSubmit = handleSubmit(async (data) => {
  console.log(data);
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
