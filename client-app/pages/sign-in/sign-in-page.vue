<template>
  <TwoColumn class="max-w-screen-xl">
    <template #left>
      <h1 class="uppercase tracking-wide text-3xl lg:text-4xl font-bold mb-8 lg:mt-5" v-t="'pages.sign_in.header'"></h1>
      <SignInForm @succeeded="onSignIn" />
    </template>
    <template #right>
      <VcImage class="max-w-md" src="/static/images/sign-in/sign-in-page-image.webp" />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { VcImage } from "@/components";
import { SignInForm } from "@/shared/account";
import { useRoute } from "vue-router";
import { TwoColumn } from "@/shared/layout";

const { query } = useRoute();

async function onSignIn() {
  location.href = (query.redirect as string) || "/";
}
</script>
