<template>
  <TwoColumn class="max-w-screen-xl">
    <template #left>
      <h1 v-t="'pages.sign_up.header'" class="mb-8 text-3xl font-bold uppercase tracking-wide lg:mt-5 lg:text-4xl"></h1>
      <form @submit="onSubmit">
        <div class="my-5 flex flex-col space-y-5 md:flex-row md:space-y-0 md:space-x-7">
          <VcRadioButton
            id="shipping"
            v-model="registrationKind"
            :value="RegistrationKind.personal"
            :label="$t('pages.sign_up.personal_registration_kind_label')"
          />

          <VcRadioButton
            id="pickup"
            v-model="registrationKind"
            :value="RegistrationKind.organization"
            :label="$t('pages.sign_up.organization_registration_kind_label')"
          />
        </div>

        <VcInput
          v-model="firstName"
          class="mb-4"
          :label="$t('pages.sign_up.first_name_label')"
          :placeholder="$t('pages.sign_up.first_name_placeholder')"
          required
          :message="errors.firstName"
          :error="!!errors.firstName"
          :maxlength="64"
          name="firstName"
          autocomplete="given-name"
        />

        <VcInput
          v-model="lastName"
          class="mb-4"
          :label="$t('pages.sign_up.last_name_label')"
          :placeholder="$t('pages.sign_up.last_name_placeholder')"
          required
          :message="errors.lastName"
          :error="!!errors.lastName"
          :maxlength="64"
          name="lastName"
          autocomplete="family-name"
        />

        <VcInput
          v-model="email"
          class="mb-4"
          :label="$t('pages.sign_up.email_label')"
          :placeholder="$t('pages.sign_up.email_placeholder')"
          required
          :message="errors.email"
          :error="!!errors.email"
          :maxlength="64"
          name="email"
          autocomplete="email"
        />

        <VcInput
          v-if="registrationKind === RegistrationKind.organization"
          v-model="organizationName"
          class="mb-4"
          :label="$t('pages.sign_up.organization_name_label')"
          :placeholder="$t('pages.sign_up.organization_name_placeholder')"
          required
          :message="errors.organizationName"
          :error="!!errors.organizationName"
          :maxlength="64"
          name="organizationName"
          autocomplete="off"
        />

        <div class="block justify-between lg:flex lg:space-x-6">
          <VcInput
            v-model="password"
            class="mb-4 w-full lg:w-1/2"
            :label="$t('pages.sign_up.password_label')"
            :placeholder="$t('pages.sign_up.password_placeholder')"
            type="password"
            autocomplete="new-password"
            required
            :message="errors.password"
            :error="!!errors.password"
            :maxlength="64"
          />

          <VcInput
            v-model="confirmPassword"
            class="mb-4 w-full lg:w-1/2"
            :label="$t('pages.sign_up.confirm_password_label')"
            :placeholder="$t('pages.sign_up.confirm_password_placeholder')"
            type="password"
            autocomplete="off"
            required
            :message="errors.confirmPassword"
            :error="!!errors.confirmPassword"
            :maxlength="64"
          />
        </div>

        <div class="mt-6 lg:mt-4">
          <VcAlert v-for="error in commonErrors" :key="error" type="danger" class="mb-4 text-xs" icon>
            {{ error }}
          </VcAlert>

          <VcButton
            is-submit
            :is-disabled="!meta.valid || meta.pending"
            size="lg"
            class="mt-6 w-full uppercase lg:mt-3 lg:w-48"
            :is-waiting="loading"
          >
            {{ $t("pages.sign_up.register_button") }}
          </VcButton>
        </div>
      </form>
    </template>

    <template #right>
      <VcImage class="max-w-md" src="/static/images/sign-up/image.webp" lazy />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import _ from "lodash";
import { useField, useForm } from "vee-validate";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import * as yup from "yup";
import { useIdentityErrorTranslator, usePageHead } from "@/core/composables";
import { RegistrationKind, RegistrationSuccessDialog, useUser } from "@/shared/account";
import { TwoColumn } from "@/shared/layout";
import { usePopup } from "@/shared/popup";
import { checkEmailUniqueness } from "@/xapi/graphql/account";
import { AccountCreationResultType } from "@/xapi/types";

const ASYNC_VALIDATION_TIMEOUT_IN_MS = 500;

const { t } = useI18n();
const { openPopup } = usePopup();
const { registerUser, registerOrganization, loading } = useUser();
const getIdentityErrorTranslation = useIdentityErrorTranslator();

usePageHead({
  title: t("pages.sign_up.meta.title"),
});

const schema = yup.object({
  registrationKind: yup.string().required(),
  organizationName: yup.string().when("registrationKind", {
    is: RegistrationKind.organization,
    then: yup.string().label("Organization Name").required().max(64),
  }),
  email: yup
    .string()
    .label("Email")
    .required()
    .email()
    .max(64)
    .test(
      "is-unique-email",
      t("common.messages.email_not_unique"),
      (value) => new Promise((resolve) => (value ? emailValidationDebounced(value, resolve) : resolve(true)))
    ),
  firstName: yup.string().label("First Name").required().max(64),
  lastName: yup.string().label("Last Name").required().max(64),
  password: yup.string().label("Password").required(),
  confirmPassword: yup
    .string()
    .label("Confirm password")
    .required()
    .oneOf([yup.ref("password"), null], t("identity_error.PasswordMismatch")),
});

const { errors, meta, handleSubmit, setFieldError } = useForm({
  validationSchema: schema,
  initialValues: {
    registrationKind: RegistrationKind.personal,
    email: "",
    organizationName: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  },
  validateOnMount: false,
});

const { value: registrationKind } = useField<RegistrationKind>("registrationKind");
const { value: firstName } = useField<string>("firstName");
const { value: lastName } = useField<string>("lastName");
const { value: email } = useField<string>("email");
const { value: organizationName } = useField<string>("organizationName");
const { value: password } = useField<string>("password");
const { value: confirmPassword } = useField<string>("confirmPassword");

const commonErrors = ref<string[]>([]);

const onSubmit = handleSubmit(async (data) => {
  commonErrors.value = [];

  let result: AccountCreationResultType;
  if (registrationKind.value === RegistrationKind.personal) {
    result = await registerUser({
      email: data.email!,
      firstName: data.firstName!,
      lastName: data.lastName!,
      userName: data.email!,
      password: data.password!,
    });
  } else {
    result = await registerOrganization({
      organizationName: data.organizationName,
      email: data.email!,
      firstName: data.firstName,
      lastName: data.lastName,
      userName: data.email!,
      password: data.password!,
    });
  }

  if (result.succeeded) {
    openPopup({
      component: RegistrationSuccessDialog,
    });
  } else if (result.errors?.length) {
    result.errors.forEach((error) => {
      const errorDescription = getIdentityErrorTranslation(error);

      switch (error.code) {
        case "PasswordTooShort":
        case "PasswordRequiresLower":
        case "PasswordRequiresUpper":
        case "PasswordRequiresUniqueChars":
        case "PasswordRequiresDigit":
        case "PasswordRequiresNonAlphanumeric":
        case "RecentPasswordUsed":
        case "InvalidPasswordHasherCompatibilityMode":
        case "InvalidPasswordHasherIterationCount":
          setFieldError("password", errorDescription);
          break;

        case "DuplicateEmail":
        case "InvalidEmail":
          setFieldError("email", errorDescription);
          break;

        default:
          if (errorDescription) {
            commonErrors.value.push(errorDescription);
          }
      }
    });
  }
});

const validateEmailUniqueness = async (value: string, resolve: (value: boolean) => void) => {
  const unique = await checkEmailUniqueness({ email: value });
  resolve(unique);
};

const emailValidationDebounced = _.debounce(validateEmailUniqueness, ASYNC_VALIDATION_TIMEOUT_IN_MS);
</script>
