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
import { SignInForm, useUser } from "@/shared/account";
import { useRouter } from "vue-router";
import { TwoColumn } from "@/shared/layout";
import { useCart } from "@/shared/cart";
import { useContext } from "@/shared/context";
import { setUserId } from "@/core/constants";

const router = useRouter();
const { me } = useUser();
const { loadMyCart } = useCart();
const { loadContext, themeContext } = useContext();

async function onSignIn() {
  await loadContext();
  setUserId(themeContext.value?.userId || me.value?.id);
  await loadMyCart();
  router.push({ name: "Dashboard" });
}
</script>
