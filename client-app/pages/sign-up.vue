<template>
  <TwoColumn class="max-w-screen-xl">
    <template #left>
      <h1 v-t="'pages.sign_up.header'" class="mb-8 text-3xl font-bold uppercase tracking-wide lg:mt-5 lg:text-4xl"></h1>
      <form @submit="onSubmit">
        <div class="my-5 flex flex-col space-y-5 md:flex-row md:space-x-7 md:space-y-0">
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
          v-model.trim="firstName"
          class="mb-4"
          :label="$t('common.labels.first_name')"
          :placeholder="$t('common.placeholders.first_name')"
          required
          :message="errors.firstName"
          :error="!!errors.firstName"
          :maxlength="64"
          name="firstName"
          autocomplete="given-name"
        />

        <VcInput
          v-model.trim="lastName"
          class="mb-4"
          :label="$t('common.labels.last_name')"
          :placeholder="$t('common.placeholders.last_name')"
          required
          :message="errors.lastName"
          :error="!!errors.lastName"
          :maxlength="64"
          name="lastName"
          autocomplete="family-name"
        />

        <VcInput
          v-model.trim="email"
          class="mb-4"
          :label="$t('common.labels.email')"
          :placeholder="$t('common.placeholders.email')"
          required
          :message="errors.email"
          :error="!!errors.email"
          :maxlength="64"
          name="email"
          autocomplete="email"
          @input="emailValidationData.isChecked = false"
        />

        <VcInput
          v-if="registrationKind === RegistrationKind.organization"
          v-model.trim="organizationName"
          class="mb-4"
          :label="$t('common.labels.company_name')"
          :placeholder="$t('common.placeholders.company_name')"
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
            :label="$t('common.labels.password')"
            :placeholder="$t('common.placeholders.password')"
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
            :label="$t('common.labels.confirm_password')"
            :placeholder="$t('common.placeholders.confirm_password')"
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

          <VcButton :disabled="!meta.valid || meta.pending" :loading="loading" class="mt-6 w-full lg:mt-3 lg:w-48">
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
import { toTypedSchema } from "@vee-validate/yup";
import { debounce } from "lodash";
import { useField, useForm } from "vee-validate";
import { reactive, ref, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { object, ref as yupRef, string } from "yup";
import { checkEmailUniqueness } from "@/core/api/graphql/account";
import { useIdentityErrorTranslator, usePageHead } from "@/core/composables";
import { RegistrationKind, RegistrationSuccessDialog, useUser } from "@/shared/account";
import { TwoColumn } from "@/shared/layout";
import { usePopup } from "@/shared/popup";
import type { AccountCreationResultType } from "@/core/api/graphql/types";

const ASYNC_VALIDATION_TIMEOUT_IN_MS = 500;

const { t } = useI18n();
const { openPopup } = usePopup();
const { registerUser, registerOrganization, loading } = useUser();
const getIdentityErrorTranslation = useIdentityErrorTranslator();

usePageHead({
  title: t("pages.sign_up.meta.title"),
});

const validationSchema = toTypedSchema(
  object({
    registrationKind: string().required(),
    organizationName: string().when("registrationKind", {
      is: RegistrationKind.organization,
      then: (stringSchema) => stringSchema.required().max(64),
    }),
    email: string()
      .required()
      .email()
      .max(64)
      .test({
        message: t("common.messages.email_not_unique"),
        test: (value) =>
          new Promise((resolve) =>
            nextTick(() =>
              emailValidationData.isChecked
                ? resolve(emailValidationData.isUnique)
                : emailValidationDebounced(value, resolve)
            )
          ),
      }),
    firstName: string().required().max(64),
    lastName: string().required().max(64),
    password: string().required(),
    confirmPassword: string()
      .required()
      .oneOf([yupRef("password")], t("identity_error.PasswordMismatch")),
  })
);

const { errors, meta, handleSubmit, setFieldError } = useForm({
  validationSchema,
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
const emailValidationData = reactive({
  isChecked: false,
  isUnique: false,
});

const emailValidationDebounced = debounce(async (value: string, resolve: (value: boolean) => void) => {
  emailValidationData.isUnique = await checkEmailUniqueness({ email: value });
  emailValidationData.isChecked = true;
  resolve(emailValidationData.isUnique);
}, ASYNC_VALIDATION_TIMEOUT_IN_MS);

const onSubmit = handleSubmit(async (data) => {
  let result: AccountCreationResultType;

  commonErrors.value = [];

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
</script>
