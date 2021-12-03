<template>
  <div class="container mx-auto w-4/5 py-5">
    <div class="grid grid-cols-1 lg:grid-cols-2 lg:gap-24">
      <div class="my-8 px-4">
        <SignInForm @succeeded="onSignIn" />
      </div>
      <div class="hidden lg:block">
        <img class="max-w-md" src="/assets/static/images/sign-in-page-image.png" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SignInForm from "@/shared/account/components/sign-in-form.vue";
import { useRouter } from "vue-router";

const router = useRouter();

function onSignIn() {
  router.push({ name: "Home" });
}
</script>

<style lang="scss" scoped></style>
