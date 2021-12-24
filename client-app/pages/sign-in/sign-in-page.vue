<template>
  <TwoColumn class="max-w-screen-xl">
    <template #left>
      <h1 class="uppercase tracking-wide text-3xl lg:text-4xl font-bold mb-8 lg:mt-5">Sign in</h1>
      <SignInForm @succeeded="onSignIn" />
    </template>
    <template #right>
      <img class="max-w-md" src="/assets/static/images/sign-in/sign-in-page-image.webp" />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { SignInForm } from "@/shared/account";
import { useRouter } from "vue-router";
import { TwoColumn } from "@/shared/layout";

const router = useRouter();

function onSignIn() {
  router.push({ name: "Home" });
}
</script>
