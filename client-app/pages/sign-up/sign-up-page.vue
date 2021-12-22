<template>
  <TwoColumn class="max-w-screen-xl">
    <template #left>
      <h1 class="uppercase tracking-wide text-3xl lg:text-4xl font-bold mb-8 lg:mt-5">Registration</h1>
      <form @submit="onSubmit">
        <VcInput
          v-model="firstName"
          class="mb-4"
          label="First Name"
          placeholder="Enter your first name"
          is-required
          :error-message="errors.firstName"
        ></VcInput>
        <VcInput
          v-model="lastName"
          class="mb-4"
          label="Last Name"
          placeholder="Enter your last name"
          is-required
          :error-message="errors.lastName"
        ></VcInput>
        <VcInput
          v-model="email"
          class="mb-4"
          label="Email"
          placeholder="Enter your e-mail address"
          type="email"
          is-required
          :error-message="errors.email"
        ></VcInput>
        <VcInput
          v-model="userName"
          class="mb-4"
          label="Username"
          placeholder="Enter your username"
          is-required
          :error-message="errors.userName"
        ></VcInput>
        <div class="block lg:flex justify-between lg:space-x-6">
          <VcInput
            v-model="password"
            class="mb-4 flex-grow"
            label="Password"
            placeholder="Enter your password"
            type="password"
            is-required
            :error-message="errors.password"
          ></VcInput>
          <VcInput
            v-model="confirmPassword"
            class="mb-4 flex-grow"
            label="Confirm password"
            placeholder="Confirm your password"
            type="password"
            is-required
            :error-message="errors.confirmPassword"
          ></VcInput>
        </div>
        <div class="mt-12 lg:mt-7">
          <button
            type="submit"
            class="w-full lg:w-48 flex justify-center items-center uppercase text-white bg-yellow-500 hover:bg-yellow-600 font-roboto-condensed text-lg h-11 rounded"
          >
            Register
          </button>
        </div>
      </form>
    </template>
    <template #right>
      <img class="max-w-md" src="/assets/static/images/sign-up/image.webp" />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { Input as VcInput } from "@/components";
import { useUser } from "@/shared/account";
import { useRouter } from "vue-router";
import { TwoColumn } from "@/shared/layout";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";

const { signMeUp } = useUser();
const router = useRouter();

const schema = yup.object({
  email: yup.string().required("This field is required").email("Enter correct email please (ex. john@gmail.com)"),
  userName: yup.string().required("This field is required"),
  firstName: yup.string().required("This field is required"),
  lastName: yup.string().required("This field is required"),
  password: yup.string().required("This field is required"),
  confirmPassword: yup
    .string()
    .required("This field is required")
    .oneOf([yup.ref("password"), null], "Passwords must match"),
});

const { errors, handleSubmit, setFieldError, meta } = useForm({
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

const onSubmit = handleSubmit(async (data) => {
  const result = await signMeUp({
    email: `${data.email}`,
    firstName: `${data.firstName}`,
    lastName: `${data.lastName}`,
    userName: `${data.userName}`,
    password: `${data.password}`,
  });

  if (result.succeeded) {
    router.push({ name: "Home" });
  } else {
    result.errors?.forEach((error) => {
      // Process password field server errors
      if (
        error?.code &&
        [
          "password-too-weak",
          "PasswordTooShort",
          "PasswordRequiresLower",
          "PasswordRequiresUpper",
          "passwordRequiresUniqueChars",
          "passwordRequiresDigit",
          "passwordRequiresNonAlphanumeric",
          "recentPasswordUsed",
        ].includes(error.code)
      ) {
        setFieldError("password", error?.description);
      }

      // Process confirmPassword field server errors
      if (error?.code === "repeat-password") {
        setFieldError("confirmPassword", error?.description);
      }
    });
  }
});
</script>
