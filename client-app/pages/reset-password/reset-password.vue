<template>
  <TwoColumn class="max-w-screen-xl">
    <template #left>
      <h1 class="uppercase tracking-wide text-3xl lg:text-4xl font-bold mb-8 lg:mb-9 lg:mt-6">reset your password</h1>
      <div v-if="!isSucceeded">
        <div class="text-lg md:text-base mb-4">Enter a new password for</div>
        <ResetPasswordForm :user-id="userId" :token="token" @succeeded="onSucceeded()"></ResetPasswordForm>
      </div>
      <div v-else class="flex flex-col items-center space-y-10 lg:space-y-12 lg:items-start lg:mt-12">
        <div class="flex flex-col items-center lg:flex-row space-x-0 space-y-10 lg:space-x-3 lg:space-y-0">
          <i class="fas fa-check-circle text-7xl lg:text-4xl text-green-600"></i>
          <div class="text-lg">Password was successfully changed</div>
        </div>
        <router-link
          to="/sign-in"
          class="bg-yellow-500 rounded text-white text-center w-48 py-2 font-bold uppercase cursor-pointer hover:bg-yellow-600"
        >
          Log in
        </router-link>
      </div>
    </template>
    <template #right>
      <img class="max-w-md" src="/assets/static/images/sign-in/sign-in-page-image.webp" />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { TwoColumn } from "@/shared/layout";
import { ResetPasswordForm } from "@/shared/account";
import { useRoute } from "vue-router";

const route = useRoute();

const userId = route.query.userId?.valueOf() as string;
const token = route.query.token?.valueOf() as string;
const isSucceeded = ref(false);

function onSucceeded() {
  isSucceeded.value = true;
}
</script>
