<template>
  <TwoColumn class="max-w-screen-xl">
    <template #left>
      <h1 class="uppercase tracking-wide text-3xl lg:text-4xl font-bold mb-8 lg:mb-9 lg:mt-6">reset your password</h1>
      <div v-if="!isSucceeded">
        <div class="text-lg md:text-base mb-4">We will send you an email to reset your password</div>
        <ForgotPasswordForm @succeeded="onSucceeded()"></ForgotPasswordForm>
      </div>
      <div v-else class="flex flex-col items-center space-y-10 lg:space-y-12 lg:items-start lg:mt-12">
        <div class="flex flex-col items-center lg:flex-row space-x-0 space-y-10 lg:space-x-3 lg:space-y-0">
          <i class="fas fa-check-circle text-7xl lg:text-4xl text-green-600"></i>
          <div class="text-lg">Reset link was sent to your email</div>
        </div>
        <VcButton to="/" type="link" class="w-48">Home page</VcButton>
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
import { ForgotPasswordForm } from "@/shared/account";
import { Button as VcButton } from "@/components";

const isSucceeded = ref(false);

function onSucceeded() {
  isSucceeded.value = true;
}
</script>
