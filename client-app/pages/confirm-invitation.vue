<template>
  <TwoColumn class="max-w-screen-xl">
    <template #left>
      <h1
        v-t="'pages.confirm_invitation.header'"
        class="uppercase tracking-wide text-3xl lg:text-4xl font-bold mb-3 lg:mt-5"
      />

      <p class="text-sm mb-4" v-html="$t('pages.confirm_invitation.text')" />

      <form @submit="onSubmit">
        <VcInput
          v-model.trim="firstName"
          :label="$t('pages.confirm_invitation.first_name_label')"
          :placeholder="$t('pages.confirm_invitation.first_name_placeholder')"
          :error-message="errors.firstName"
          :is-disabled="loading"
          :maxlength="64"
          class="mb-4"
          is-required
        />

        <VcInput
          v-model.trim="lastName"
          :label="$t('pages.confirm_invitation.last_name_label')"
          :placeholder="$t('pages.confirm_invitation.last_name_placeholder')"
          :error-message="errors.lastName"
          :is-disabled="loading"
          :maxlength="64"
          class="mb-4"
          is-required
        />

        <VcInput
          :model-value="email"
          :label="$t('pages.confirm_invitation.email_label')"
          :error-message="errors.email"
          class="mb-4"
          is-disabled
          is-required
        />

        <div class="flex flex-col md:flex-row gap-x-6 gap-y-4">
          <VcInput
            v-model="password"
            :label="$t('pages.confirm_invitation.password_label')"
            :placeholder="$t('pages.confirm_invitation.password_placeholder')"
            :error-message="errors.password"
            :is-disabled="loading"
            :maxlength="64"
            type="password"
            autocomplete="new-password"
            class="md:w-1/2"
            is-required
          />

          <VcInput
            v-model="confirmPassword"
            :label="$t('pages.confirm_invitation.confirm_password_label')"
            :placeholder="$t('pages.confirm_invitation.confirm_password_placeholder')"
            :error-message="errors.confirmPassword"
            :is-disabled="loading"
            :maxlength="64"
            type="password"
            autocomplete="off"
            class="md:w-1/2"
            is-required
          />
        </div>

        <div class="mt-6">
          <VcAlert v-for="error in commonErrors" :key="error" type="danger" class="mb-4 text-xs" icon>
            {{ error }}
          </VcAlert>

          <VcButton
            :is-waiting="loading"
            :is-disabled="!meta.valid"
            size="lg"
            class="uppercase w-full lg:w-48 mt-4"
            is-submit
          >
            {{ $t("pages.confirm_invitation.register_button") }}
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
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { useIdentityErrorTranslator, usePageHead, useRouteQueryParam } from "@/core/composables";
import { RegistrationSuccessDialog, useUser } from "@/shared/account";
import { TwoColumn } from "@/shared/layout";
import { usePopup } from "@/shared/popup";

const commonErrors = ref<string[]>([]);

const { t } = useI18n();

usePageHead({
  title: t("pages.confirm_invitation.meta.title"),
});

const { openPopup } = usePopup();
const { loading, registerByInvite } = useUser();
const getIdentityErrorTranslation = useIdentityErrorTranslator();

const userId = useRouteQueryParam<string>("userId");
const email = useRouteQueryParam<string>("email");
const token = useRouteQueryParam<string>("token");

const schema = yup.object({
  firstName: yup.string().required().max(64),
  lastName: yup.string().required().max(64),
  email: yup.string().required().email(),
  password: yup.string().required(),
  confirmPassword: yup
    .string()
    .required()
    .oneOf([yup.ref("password"), null], t("identity_error.PasswordMismatch")),
});

const { errors, meta, handleSubmit, setFieldError } = useForm({
  validationSchema: schema,
  initialValues: {
    email: email.value,
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  },
});

const { value: firstName } = useField<string>("firstName");
const { value: lastName } = useField<string>("lastName");
const { value: password } = useField<string>("password");
const { value: confirmPassword } = useField<string>("confirmPassword");

const onSubmit = handleSubmit(async (data) => {
  commonErrors.value = [];

  const result = await registerByInvite({
    userId: userId.value,
    token: token.value,
    username: email.value,
    firstName: data.firstName!,
    lastName: data.lastName!,
    password: data.password!,
  });

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

        default:
          if (errorDescription) {
            commonErrors.value.push(errorDescription);
          }
      }
    });
  }
});
</script>
