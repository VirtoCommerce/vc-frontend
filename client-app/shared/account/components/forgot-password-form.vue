<template>
  <form @submit="onSubmit">
    <VcInput
      v-model="email"
      class="mb-4"
      label="Email"
      placeholder="Enter your e-mail"
      type="email"
      is-required
      :error-message="errors.email"
    ></VcInput>
    <div class="mt-8 md:mt-9">
      <Alert v-for="error in commonErrors" :key="error" class="mb-4 text-xs">{{ error }}</Alert>
      <button
        type="submit"
        class="mt-6 lg:mt-3 w-full lg:w-48 h-11 rounded cursor-pointer flex justify-center items-center uppercase text-white bg-yellow-500 font-roboto-condensed text-lg"
        :class="{ 'hover:bg-yellow-600': !loading, 'cursor-wait': loading }"
        :disabled="loading"
      >
        Submit
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { Alert, Input as VcInput } from "@/components";
import { ref } from "vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { useUser } from "@/shared/account";

const { forgotPassword, loading } = useUser();

const emit = defineEmits(["succeeded"]);

const schema = yup.object({
  email: yup.string().label("Email").required().email("Enter correct email please (ex. john@gmail.com)").max(64),
});

const { errors, handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: {
    email: "",
  },
  validateOnMount: false,
});

const { value: email } = useField<string>("email");

const commonErrors = ref<string[]>([]);

const onSubmit = handleSubmit(async (data) => {
  commonErrors.value = [];

  const resetPasswordUrl = location.origin + "/reset-password";

  const result = await forgotPassword({
    email: `${data.email}`,
    resetPasswordUrl,
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
