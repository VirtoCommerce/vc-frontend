<template>
  <h1 class="mb-6 font-semibold uppercase text-4xl">Sign In</h1>
  <div v-if="authError" class="flex space-x-3 px-3 py-2.5 h-11 bg-red-100 rounded-sm">
    <img class="w-4 h-auto" src="/assets/static/images/error-icon.svg" />
    <span><strong>User</strong> or <strong>password</strong> is incorrect</span>
  </div>
  <div class="mt-4">
    <span class="font-semibold" for>User name</span>
    <span class="text-red-500">*</span>
    <input
      type="text"
      placeholder="User Name"
      class="border h-11 border-gray-300 rounded px-3 py-1 w-full"
      v-model="model.userName"
    />
  </div>
  <div class="mt-4">
    <span class="font-semibold" for>Password</span>
    <span class="text-red-500">*</span>
    <input
      type="password"
      placeholder="Password"
      class="border h-11 border-gray-300 rounded px-3 py-1 w-full"
      v-model="model.password"
    />
  </div>
  <a href="/" class="text-blue-700 hover:text-blue-500 text-sm font-medium">Forgot your password?</a>
  <div class="flex space-x-5 mt-8">
    <button
      @click="signIn"
      class="flex-1 md:flex-grow-0 bg-yellow-500 hover:bg-yellow-600 uppercase font-bold rounded text-white px-10 py-2 text-sm"
    >
      Login
    </button>
    <button
      class="flex-1 md:flex-grow-0 border-2 border-yellow-500 hover:bg-yellow-600 hover:text-white hover:border-yellow-600 uppercase font-bold rounded text-yellow-500 px-10 py-2 text-sm"
    >
      Registration
    </button>
  </div>
</template>

<script setup lang="ts">
import useUser from "@/shared/account/composables/useUser";
import { SignMeIn } from "@/shared/account/types";
import { ref, reactive } from "@vue/reactivity";
import { Ref } from "vue";

const { signMeIn } = useUser();

const emit = defineEmits(["succeeded"]);

const model = reactive<SignMeIn>({
  userName: "",
  password: "",
});

const authError: Ref<boolean> = ref(false);

async function signIn() {
  authError.value = false;

  var result = await signMeIn(model);

  if (result.succeeded) {
    emit("succeeded");
    // router.push({ name: "Home" });
  } else {
    authError.value = true;
  }
}
</script>

<style lang="scss" scoped></style>
