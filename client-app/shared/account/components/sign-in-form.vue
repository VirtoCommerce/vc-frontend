<template>
  <h1 class="mb-6 font-semibold uppercase text-4xl">Sign In</h1>
  <form @submit="onSubmit">
    <div v-if="authError" class="flex space-x-3 px-3 py-2.5 h-11 bg-red-100 rounded-sm">
      <img class="w-4 h-auto" src="/assets/static/images/error-icon.svg" />
      <span> <strong>User</strong> or <strong>password</strong> is incorrect </span>
    </div>
    <div v-if="!_.isEmpty(errors)" class="mt-2 flex space-x-3 px-3 py-2.5 h-11 bg-red-100 rounded-sm">
      <img class="w-4 h-auto" src="/assets/static/images/error-icon.svg" />
      <span> <strong>User</strong> and <strong>password</strong> are required </span>
    </div>
    <div class="mt-4">
      <span class="font-semibold" for>User name</span>
      <span class="text-red-500">*</span>
      <input
        type="text"
        name="userName"
        placeholder="User Name"
        class="h-11 rounded px-3 py-1 w-full"
        v-model="userName"
        :class="{
          'border border-gray-300': !isErrorField('userName'),
          'border-2 border-red-500': isErrorField('userName'),
        }"
      />
    </div>
    <div class="mt-4">
      <span class="font-semibold" for>Password</span>
      <span class="text-red-500">*</span>
      <input
        type="password"
        name="password"
        placeholder="Password"
        class="h-11 rounded px-3 py-1 w-full"
        v-model="password"
        :class="{
          'border border-gray-300': !isErrorField('password'),
          'border-2 border-red-500': isErrorField('password'),
        }"
      />
    </div>
    <div class="mt-1">
      <a href="/" class="text-blue-700 hover:text-blue-500 text-sm font-semibold">Forgot your password?</a>
    </div>
    <div class="flex space-x-5 mt-8">
      <button
        type="submit"
        class="flex-1 md:flex-grow-0 bg-yellow-500 uppercase font-bold rounded text-white px-10 py-2 text-sm"
        :class="{ 'hover:bg-yellow-600': isSubmitEnabled }"
        :disabled="!isSubmitEnabled"
      >
        Login
      </button>
      <button
        class="flex-1 md:flex-grow-0 border-2 border-yellow-500 hover:bg-yellow-600 hover:text-white hover:border-yellow-600 uppercase font-bold rounded text-yellow-500 px-10 py-2 text-sm"
      >
        Registration
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import useUser from "@/shared/account/composables/useUser";
import { ref, reactive } from "@vue/reactivity";
import { computed, Ref } from "vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import _ from "lodash";

const { signMeIn } = useUser();

const emit = defineEmits(["succeeded"]);

const authError: Ref<boolean> = ref(false);

const schema = yup.object({
  userName: yup.string().required(),
  password: yup.string().required(),
});

const { errors, meta, handleSubmit, isSubmitting } = useForm({
  validationSchema: schema,
});

const { value: userName } = useField<string>("userName");
const { value: password } = useField<string>("password");

const model = reactive({ userName, password });

function isErrorField(name: string) {
  return meta.value.touched && name in errors.value;
}

// submit
const isSubmitEnabled = computed(() => !isSubmitting.value);

const onSubmit = handleSubmit(async () => {
  var result = await signMeIn(model);

  if (result.succeeded) {
    emit("succeeded");
  } else {
    authError.value = true;
  }
});
</script>

<style lang="scss" scoped></style>
