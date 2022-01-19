<template>
  <form @submit="onSubmit">
    <!-- Errors block -->
    <Alert v-if="authError"><strong>User</strong> or <strong>password</strong> is incorrect</Alert>
    <Alert v-if="!_.isEmpty(errors)" class="mt-2"
      ><strong>User</strong> and <strong>password</strong> are required
    </Alert>

    <div class="mt-4">
      <span class="font-semibold">User name</span>
      <span class="text-red-500">*</span>
      <input
        v-model="userName"
        type="text"
        name="userName"
        placeholder="User Name"
        class="h-11 rounded px-3 py-1 w-full"
        :class="{
          'border border-gray-300': !isErrorField('userName'),
          'border-2 border-red-500': isErrorField('userName'),
        }"
        @input="onInput"
      />
    </div>

    <div class="mt-4">
      <span class="font-semibold" for>Password</span>
      <span class="text-red-500">*</span>
      <input
        v-model="password"
        type="password"
        name="password"
        placeholder="Password"
        class="h-11 rounded px-3 py-1 w-full"
        :class="{
          'border border-gray-300': !isErrorField('password'),
          'border-2 border-red-500': isErrorField('password'),
        }"
        @input="onInput"
      />
    </div>

    <div class="mt-1">
      <router-link to="/forgot-password" class="text-blue-700 hover:text-blue-500 text-sm font-semibold">
        Forgot your password?
      </router-link>
    </div>

    <!-- Form actions -->
    <div class="flex mt-8 text-base font-roboto-condensed" :class="{ 'max-w-sm': !props.growButtons }">
      <button
        type="submit"
        class="flex-1 flex-shrink bg-yellow-500 rounded text-white px-2 py-2 font-bold uppercase cursor-pointer"
        :class="{ 'hover:bg-yellow-600': isSubmitEnabled }"
        :disabled="!isSubmitEnabled"
      >
        Login
      </button>
      <router-link
        to="/sign-up"
        class="flex-1 border-2 rounded text-center text-yellow-500 ml-4 px-2 py-2 border-yellow-500 uppercase font-bold hover:bg-yellow-600 hover:text-white hover:border-yellow-600 cursor-pointer"
      >
        Registration
      </router-link>
    </div>
  </form>
</template>

<script setup lang="ts">
import { Alert } from "@/components";
import { ref, reactive, computed, Ref } from "vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import _ from "lodash";
import { useUser } from "@/shared/account";

const { signMeIn, loading } = useUser();

const props = withDefaults(defineProps<{ growButtons?: boolean }>(), { growButtons: false });

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

function onInput() {
  authError.value = false;
}

// submit
const isSubmitEnabled = computed(() => !isSubmitting.value && !loading.value);

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
