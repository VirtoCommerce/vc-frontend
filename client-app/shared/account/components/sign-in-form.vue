<template>
  <h1 class="mb-6 font-semibold uppercase text-xl md:text-4xl">Sign In</h1>
  <form @submit="onSubmit">
    <alert-message v-if="authError"><strong>User</strong> or <strong>password</strong> is incorrect</alert-message>
    <alert-message v-if="!_.isEmpty(errors)" class="mt-2"
      ><strong>User</strong> and <strong>password</strong> are required
    </alert-message>
    <div class="mt-4">
      <span class="font-semibold">User name</span>
      <span class="text-red-500">*</span>
      <input
        type="text"
        name="userName"
        placeholder="User Name"
        class="h-11 rounded px-3 py-1 w-full"
        v-model="userName"
        @input="onInput"
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
        @input="onInput"
        :class="{
          'border border-gray-300': !isErrorField('password'),
          'border-2 border-red-500': isErrorField('password'),
        }"
      />
    </div>
    <div class="mt-1">
      <router-link to="/" class="text-blue-700 hover:text-blue-500 text-sm font-semibold">
        Forgot your password?
      </router-link>
    </div>
    <div class="flex gap-4 mt-8 text-base font-roboto" :class="{ 'max-w-sm': !props.growButtons }">
      <button
        type="submit"
        class="flex-1 bg-yellow-500 rounded text-white px-2 py-2 font-bold uppercase"
        :class="{ 'hover:bg-yellow-600': isSubmitEnabled }"
        :disabled="!isSubmitEnabled"
      >
        Login
      </button>
      <button
        class="flex-1 border-2 rounded text-yellow-500 px-2 py-2 border-yellow-500 uppercase font-bold hover:bg-yellow-600 hover:text-white hover:border-yellow-600"
      >
        Registration
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import AlertMessage from "@/components/AlertMessage.vue";
import { computed, Ref } from "vue";
import { ref, reactive } from "@vue/reactivity";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import _ from "lodash";
import useUser from "@/shared/account/composables/useUser";

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
