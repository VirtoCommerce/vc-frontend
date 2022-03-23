<template>
  <TwoColumn class="max-w-screen-xl">
    <template #left>
      <h1 class="uppercase tracking-wide text-3xl lg:text-4xl font-bold mb-8 lg:mt-5" v-t="'pages.sign_up.header'"></h1>
      <form @submit="onSubmit">
        <VcInput
          v-model="firstName"
          class="mb-4"
          :label="$t('pages.sign_up.first_name_label')"
          :placeholder="$t('pages.sign_up.first_name_placeholder')"
          is-required
          :error-message="errors.firstName"
        ></VcInput>
        <VcInput
          v-model="lastName"
          class="mb-4"
          :label="$t('pages.sign_up.last_name_label')"
          :placeholder="$t('pages.sign_up.last_name_placeholder')"
          is-required
          :error-message="errors.lastName"
        ></VcInput>
        <VcInput
          v-model="email"
          class="mb-4"
          :label="$t('pages.sign_up.email_label')"
          :placeholder="$t('pages.sign_up.email_placeholder')"
          type="email"
          is-required
          :error-message="errors.email"
        ></VcInput>
        <VcInput
          v-model="userName"
          class="mb-4"
          :label="$t('pages.sign_up.username_label')"
          :placeholder="$t('pages.sign_up.username_placeholder')"
          is-required
          :error-message="errors.userName"
        ></VcInput>
        <div class="block lg:flex justify-between lg:space-x-6">
          <VcInput
            v-model="password"
            class="mb-4 w-full lg:w-1/2"
            :label="$t('pages.sign_up.password_label')"
            :placeholder="$t('pages.sign_up.password_placeholder')"
            type="password"
            is-required
            :error-message="errors.password"
          ></VcInput>
          <VcInput
            v-model="confirmPassword"
            class="mb-4 w-full lg:w-1/2"
            :label="$t('pages.sign_up.confirm_password_label')"
            :placeholder="$t('pages.sign_up.confirm_password_placeholder')"
            type="password"
            is-required
            :error-message="errors.confirmPassword"
          ></VcInput>
        </div>
        <div class="mt-6 lg:mt-4">
          <VcAlert v-for="error in commonErrors" :key="error" type="error" class="mb-4 text-xs" icon text>
            {{ error }}
          </VcAlert>

          <VcButton
            is-submit
            size="lg"
            class="uppercase mt-6 lg:mt-3 w-full lg:w-48"
            :is-waiting="loading"
            v-t="'pages.sign_up.register_button'"
          ></VcButton>
        </div>
      </form>
    </template>
    <template #right>
      <VcImage class="max-w-md" src="/static/images/sign-up/image.webp" />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { VcAlert, VcInput, VcImage, VcButton } from "@/components";
import { useUser, RegistrationSuccessDialog } from "@/shared/account";
import { TwoColumn } from "@/shared/layout";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { ref } from "vue";
import { usePopup } from "@/shared/popup";

const { signMeUp, loading } = useUser();
const { openPopup } = usePopup();

const schema = yup.object({
  email: yup.string().label("Email").required().email("Enter correct email please (ex. john@gmail.com)").max(64),
  userName: yup.string().label("Username").required().max(64),
  firstName: yup.string().label("First Name").required().max(64),
  lastName: yup.string().label("Last Name").required().max(64),
  password: yup.string().label("Password").required(),
  confirmPassword: yup
    .string()
    .label("Confirm password")
    .required()
    .oneOf([yup.ref("password"), null], "Passwords must match"),
});

const { errors, handleSubmit, setFieldError } = useForm({
  validationSchema: schema,
  initialValues: {
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  },
  validateOnMount: false,
});

const { value: firstName } = useField<string>("firstName");
const { value: lastName } = useField<string>("lastName");
const { value: userName } = useField<string>("userName");
const { value: email } = useField<string>("email");
const { value: password } = useField<string>("password");
const { value: confirmPassword } = useField<string>("confirmPassword");

const commonErrors = ref<string[]>([]);

const onSubmit = handleSubmit(async (data) => {
  commonErrors.value = [];

  const result = await signMeUp({
    email: `${data.email}`,
    firstName: `${data.firstName}`,
    lastName: `${data.lastName}`,
    userName: `${data.userName}`,
    password: `${data.password}`,
  });

  if (result.succeeded) {
    openPopup({
      component: RegistrationSuccessDialog,
    });
  } else {
    if (result.errors?.length) {
      for (let i = 0; i < result.errors?.length; i++) {
        const error = result.errors[i];

        switch (error?.code) {
          case "password-too-weak":
          case "PasswordTooShort":
          case "PasswordRequiresLower":
          case "PasswordRequiresUpper":
          case "PasswordRequiresUniqueChars":
          case "PasswordRequiresDigit":
          case "PasswordRequiresNonAlphanumeric":
          case "RecentPasswordUsed":
          case "InvalidPasswordHasherCompatibilityMode":
          case "InvalidPasswordHasherIterationCount":
            setFieldError("password", error?.description);
            break;

          case "repeat-password":
          case "PasswordMismatch":
            setFieldError("confirmPassword", error?.description);
            break;

          case "DuplicateUserName":
          case "InvalidUserName":
          case "LoginAlreadyAssociated":
            setFieldError("userName", error?.description);
            break;

          case "DuplicateEmail":
          case "InvalidEmail":
            setFieldError("email", error?.description);
            break;

          default:
            if (error?.description) {
              commonErrors.value.push(error.description);
            }
        }
      }
    }
  }
});
</script>
