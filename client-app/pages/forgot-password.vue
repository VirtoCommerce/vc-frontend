<template>
  <TwoColumn class="max-w-screen-xl">
    <template #left>
      <h1
        v-t="'pages.forgot_password.header'"
        class="mb-8 text-3xl font-bold uppercase tracking-wide lg:mt-5 lg:text-4xl"
      ></h1>
      <div v-if="!isSucceeded">
        <div v-t="'pages.forgot_password.email_will_be_sended_message'" class="mb-4 text-lg md:text-base"></div>
        <ForgotPasswordForm @succeeded="onSucceeded()"></ForgotPasswordForm>
      </div>
      <div v-else class="flex flex-col items-center space-y-10 lg:mt-12 lg:items-start lg:space-y-12">
        <div class="flex flex-col items-center space-x-0 space-y-10 lg:flex-row lg:space-x-3 lg:space-y-0">
          <i class="fas fa-check-circle text-7xl text-green-600 lg:text-4xl"></i>
          <div class="text-lg">{{ $t("pages.forgot_password.reset_link_was_sent_message") }}</div>
        </div>

        <VcButton to="/" class="w-48 uppercase">
          {{ $t("pages.forgot_password.home_button") }}
        </VcButton>
      </div>
    </template>
    <template #right>
      <VcImage class="max-w-md" src="/static/images/sign-in/sign-in-page-image.webp" lazy />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { ForgotPasswordForm } from "@/shared/account";
import { TwoColumn } from "@/shared/layout";

const { t } = useI18n();

usePageHead({
  title: t("pages.forgot_password.meta.title"),
});

const isSucceeded = ref(false);

function onSucceeded() {
  isSucceeded.value = true;
}
</script>
