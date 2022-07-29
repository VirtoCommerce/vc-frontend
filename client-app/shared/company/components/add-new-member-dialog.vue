<template>
  <VcPopup
    ref="popupComponent"
    :title="$t('shared.company.add_new_member_dialog.title')"
    modal-width="sm:max-w-md"
    is-mobile-fullscreen
  >
    <template #actions="{ close }">
      <VcButton
        class="uppercase w-full sm:w-auto sm:px-10"
        kind="secondary"
        :is-disabled="isSubmitting"
        is-outline
        @click="close"
      >
        {{ $t("shared.company.add_new_member_dialog.cancel_button") }}
      </VcButton>

      <VcButton
        class="uppercase w-full sm:w-auto sm:px-10"
        :is-disabled="!meta.dirty || !meta.valid"
        :is-waiting="isSubmitting"
        @click="onSubmit"
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
// import { AddNewMember } from "@/shared/company";
import { ROLES } from "@/core/securityConstants";
import { shallowRef } from "vue";
import { VcPopup } from "@/ui-kit/components";
import { useOrganizationContacts } from "@/shared/account";
import { useNotifications } from "@/shared/notification";
import { Role } from "@/core/types/role";

const { t } = useI18n();
// const { organization } = useUser();
const notifications = useNotifications();
const { addNewContact } = useOrganizationContacts();

const popupComponent = shallowRef<VcPopup | null>(null);
const ASYNC_VALIDATION_TIMEOUT_IN_MS = 3000;

usePageHead({
  title: t("pages.sign_up.meta.title"),
});

const emit = defineEmits<{ (e: "result", success: boolean): void }>();

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

const { errors, handleSubmit, meta, isSubmitting } = useForm({
  validationSchema: schema,
  initialValues: {
    role: undefined,
    email: "",
    firstName: "",
    lastName: "",
  },
  validateOnMount: false,
});

const { value: role } = useField<Role>("role");
const { value: firstName } = useField<string>("firstName");
const { value: lastName } = useField<string>("lastName");
const { value: email } = useField<string>("email");

const onSubmit = handleSubmit(async (data) => {
  const roleEntity = ROLES.find((x) => x.id == data.role);

  const result = await addNewContact({
    role: roleEntity!,
    email: data.email as string,
    firstName: data.firstName as string,
    lastName: data.lastName as string,
  });

  if (result.succeeded) {
    notifications.success({
      text: t("shared.company.add_new_member_dialog.successfully_text", [data.email]),
      duration: 15000,
      single: true,
    });

    emit("result", true);
  } else if (result.errors?.length) {
    // errorText.value = result.errors
    //   .filter((error) => error.code !== "DuplicateUserName") // Because email is a `UserName` (login)
    //   .map((error) => error.description)
    //   .join(" ");
  }

  popupComponent.value?.close();
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
