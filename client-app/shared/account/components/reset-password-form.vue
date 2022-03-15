<template>
  <form @submit="onSubmit">
    <VcInput
      v-model="password"
      class="mb-4 w-full"
      label="Password"
      placeholder="Enter your password"
      type="password"
      is-required
      :error-message="errors.password"
    ></VcInput>
    <VcInput
      v-model="confirmPassword"
      class="mb-4 w-full"
      label="Confirm password"
      placeholder="Confirm your password"
      type="password"
      is-required
      :error-message="errors.confirmPassword"
    ></VcInput>
    <div class="mt-8 md:mt-9">
      <VcAlert v-for="error in commonErrors" :key="error" type="error" class="mb-4 text-xs" icon text>
        {{ error }}
      </VcAlert>

      <VcButton is-submit class="mt-6 lg:mt-3 w-full lg:w-52 uppercase" :is-waiting="loading">
        Reset password
      </VcButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { VcAlert, VcInput, VcButton } from "@/components";
import { ref } from "vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { useUser } from "@/shared/account";

const { resetPassword, loading } = useUser();

const emit = defineEmits(["succeeded"]);

const props = defineProps({
  userId: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
});

const schema = yup.object({
  password: yup.string().label("Password").required(),
  confirmPassword: yup
    .string()
    .label("Confirm password")
    .required()
    .oneOf([yup.ref("password"), null], "Passwords must match"),
});

const { errors, handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: {
    password: "",
    confirmPassword: "",
  },
  validateOnMount: false,
});

const { value: password } = useField<string>("password");
const { value: confirmPassword } = useField<string>("confirmPassword");

const commonErrors = ref<string[]>([]);

const onSubmit = handleSubmit(async (data) => {
  commonErrors.value = [];

  const result = await resetPassword({
    userId: props.userId,
    token: props.token,
    password: `${data.password}`,
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
