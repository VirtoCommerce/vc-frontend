<template>
  <TwoColumn class="max-w-screen-xl">
    <template #left>
      <h1
        v-t="'pages.change_password.header'"
        class="mb-8 text-3xl font-bold uppercase tracking-wide lg:mt-5 lg:text-4xl"
      ></h1>
      <div v-if="!isSucceeded">
        <ChangePasswordForm @succeeded="onSucceeded()"></ChangePasswordForm>
      </div>
      <div v-else class="flex flex-col items-center space-y-10 lg:mt-12 lg:items-start lg:space-y-12">
        <div class="flex flex-col items-center space-x-0 space-y-10 lg:flex-row lg:space-x-3 lg:space-y-0">
          <i class="fas fa-check-circle text-7xl text-green-600 lg:text-4xl"></i>
          <div class="text-lg">{{ $t("pages.change_password.success_message") }}</div>
        </div>
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
import { getReturnUrlValue } from "@/core/utilities";
import { ChangePasswordForm } from "@/shared/account";
import { TwoColumn } from "@/shared/layout";

const { t } = useI18n();

usePageHead({
  title: t("pages.change_password.meta.title"),
});

const isSucceeded = ref(false);

function onSucceeded() {
  isSucceeded.value = true;
  setTimeout(() => {
    location.href = getReturnUrlValue() || "/";
  }, 3000);
}
</script>
