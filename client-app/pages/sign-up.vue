<template>
  <TwoColumn class="max-w-screen-xl">
    <template #left>
      <VcTypography tag="h1" class="mb-6">
        {{ $t("pages.sign_up.header") }}
      </VcTypography>

      <form @submit="onSubmit">
        <div class="my-5 flex flex-col space-y-5 md:flex-row md:space-x-7 md:space-y-0">
          <VcRadioButton
            id="shipping"
            v-model="registrationKind"
            :value="RegistrationKind.personal"
            :label="$t('pages.sign_up.personal_registration_kind_label')"
            :disabled="loading"
          />

          <VcRadioButton
            id="pickup"
            v-model="registrationKind"
            :value="RegistrationKind.organization"
            :label="$t('pages.sign_up.organization_registration_kind_label')"
            :disabled="loading"
          />
        </div>

        <VcInput
          v-model="firstName"
          :label="$t('common.labels.first_name')"
          :placeholder="$t('common.placeholders.first_name')"
          :message="errors.firstName"
          :error="!!errors.firstName"
          :maxlength="64"
          :disabled="loading"
          class="mb-4"
          name="firstName"
          required
          autocomplete="given-name"
        />

        <VcInput
          v-model="lastName"
          :label="$t('common.labels.last_name')"
          :placeholder="$t('common.placeholders.last_name')"
          :message="errors.lastName"
          :error="!!errors.lastName"
          :maxlength="64"
          :disabled="loading"
          class="mb-4"
          name="lastName"
          required
          autocomplete="family-name"
        />

        <VcInput
          v-model="email"
          :label="$t('common.labels.email')"
          :placeholder="$t('common.placeholders.email')"
          :message="errors.email"
          :error="!!errors.email"
          :maxlength="64"
          :disabled="loading"
          class="mb-4"
          name="email"
          required
          autocomplete="email"
          @input="emailValidationData.isChecked = false"
        />

        <VcInput
          v-if="registrationKind === RegistrationKind.organization"
          v-model="organizationName"
          :label="$t('common.labels.company_name')"
          :placeholder="$t('common.placeholders.company_name')"
          :message="errors.organizationName"
          :error="!!errors.organizationName"
          :maxlength="64"
          :disabled="loading"
          class="mb-4"
          required
          name="organizationName"
          autocomplete="off"
        />

        <div class="block justify-between lg:flex lg:space-x-6">
          <VcInput
            v-model="password"
            :label="$t('common.labels.password')"
            :placeholder="$t('common.placeholders.password')"
            :message="errors.password"
            :error="!!errors.password"
            :maxlength="64"
            :disabled="loading"
            class="mb-4 w-full lg:w-1/2"
            type="password"
            autocomplete="new-password"
            required
          />

          <VcInput
            v-model="confirmPassword"
            :label="$t('common.labels.confirm_password')"
            :placeholder="$t('common.placeholders.confirm_password')"
            :message="errors.confirmPassword"
            :error="!!errors.confirmPassword"
            :maxlength="64"
            :disabled="loading"
            class="mb-4 w-full lg:w-1/2"
            type="password"
            autocomplete="off"
            required
          />
        </div>

        <div class="mt-6 lg:mt-4">
          <PasswordTips v-if="passwordRequirements" :requirements="passwordRequirements" />

          <VcAlert
            v-for="error in commonErrors"
            :key="error"
            color="danger"
            size="sm"
            variant="solid-light"
            class="mt-3 text-xs"
            icon
          >
            {{ error }}
          </VcAlert>

          <VcButton :loading="loading" type="submit" class="mt-6 w-full lg:mt-3 lg:w-48">
            {{ $t("pages.sign_up.register_button") }}
          </VcButton>
        </div>
      </form>
    </template>

    <template #right>
      <VcImage
        :alt="$t('common.labels.background_image')"
        class="max-w-md"
        src="/static/images/sign-up/image.webp"
        lazy
      />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { useDebounceFn } from "@vueuse/core";
import { useField, useForm } from "vee-validate";
import { reactive, ref, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { object, ref as yupRef, string } from "yup";
import { checkEmailUniqueness } from "@/core/api/graphql/account";
import { usePageHead, useErrorsTranslator } from "@/core/composables";
import { PasswordTips, RegistrationKind, usePasswordRequirements, useUser } from "@/shared/account";
import { TwoColumn } from "@/shared/layout";
import type { AccountCreationResultType, RegistrationErrorType } from "@/core/api/graphql/types";

const router = useRouter();

const ASYNC_VALIDATION_TIMEOUT_IN_MS = 500;

const { t } = useI18n();
const { registerUser, registerOrganization, loading } = useUser();
const { passwordRequirements } = usePasswordRequirements();
const { translate } = useErrorsTranslator<RegistrationErrorType>("identity_error");

usePageHead({
  title: t("pages.sign_up.meta.title"),
});

const validationSchema = toTypedSchema(
  object({
    registrationKind: string().required(),
    organizationName: string()
      .trim()
      .when("registrationKind", {
        is: RegistrationKind.organization,
        then: (stringSchema) => stringSchema.required().max(64),
      }),
    email: string()
      .trim()
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
                : emailValidationDebounced(value, resolve),
            ),
          ),
      }),
    firstName: string().trim().required().max(64),
    lastName: string().trim().required().max(64),
    password: string().required(),
    confirmPassword: string()
      .required()
      .oneOf([yupRef("password")], t("common.messages.passwords_do_not_match")),
  }),
);

const { errors, handleSubmit, setFieldError } = useForm({
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

const emailValidationDebounced = useDebounceFn(async (value: string, resolve: (value: boolean) => void) => {
  emailValidationData.isUnique = await checkEmailUniqueness({ email: value });
  emailValidationData.isChecked = true;
  resolve(emailValidationData.isUnique);
}, ASYNC_VALIDATION_TIMEOUT_IN_MS);

const onSubmit = handleSubmit(async (data) => {
  let result: AccountCreationResultType;

  commonErrors.value = [];

  if (registrationKind.value === RegistrationKind.personal) {
    result = await registerUser({
      email: data.email.trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      userName: data.email.trim(),
      password: data.password,
    });
  } else {
    result = await registerOrganization({
      organizationName: data.organizationName?.trim(),
      email: data.email.trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      userName: data.email.trim(),
      password: data.password,
    });
  }

  if (result.succeeded) {
    void router.push({ name: "Welcome" });
  } else if (result.errors?.length) {
    result.errors.forEach((error) => {
      const errorDescription = translate(error);

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
