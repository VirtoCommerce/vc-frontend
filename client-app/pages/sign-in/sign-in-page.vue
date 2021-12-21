<template>
  <div class="polygon-bg flex-grow">
    <div class="container mx-auto w-5/6 md:w-4/5 pt-5">
      <div class="flex lg:gap-24">
        <div class="flex-grow my-8 md:px-4">
          <SignInForm @succeeded="onSignIn" />
        </div>
        <div class="flex-grow hidden lg:block">
          <img class="max-w-md" src="/assets/static/images/sign-in/sign-in-page-image.webp" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SignInForm } from "@/shared/account";
import { useRouter } from "vue-router";

const router = useRouter();

function onSignIn() {
  router.push({ name: "Home" });
}
</script>

<style lang="scss" scoped></style>
