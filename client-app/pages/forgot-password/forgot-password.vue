<template>
  <TwoColumn class="max-w-screen-xl">
    <template #left>
      <h1
        class="uppercase tracking-wide text-3xl lg:text-4xl font-bold mb-8 lg:mb-9 lg:mt-6"
        v-t="'pages.forgot_password.header'"
      ></h1>
      <div v-if="!isSucceeded">
        <div class="text-lg md:text-base mb-4" v-t="'pages.forgot_password.email_will_be_sended_message'"></div>
        <ForgotPasswordForm @succeeded="onSucceeded()"></ForgotPasswordForm>
      </div>
      <div v-else class="flex flex-col items-center space-y-10 lg:space-y-12 lg:items-start lg:mt-12">
        <div class="flex flex-col items-center lg:flex-row space-x-0 space-y-10 lg:space-x-3 lg:space-y-0">
          <i class="fas fa-check-circle text-7xl lg:text-4xl text-green-600"></i>
          <div class="text-lg">{{ $t("pages.forgot_password.reset_link_was_sent_message") }}</div>
        </div>
        <VcButton to="/" class="w-48 uppercase" v-t="'pages.forgot_password.home_button'"></VcButton>
      </div>
    </template>
    <template #right>
      <VcImage class="max-w-md" src="/static/images/sign-in/sign-in-page-image.webp" />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcImage, VcButton } from "@/components";
import { TwoColumn } from "@/shared/layout";
import { ForgotPasswordForm } from "@/shared/account";

const isSucceeded = ref(false);

function onSucceeded() {
  isSucceeded.value = true;
}
</script>
