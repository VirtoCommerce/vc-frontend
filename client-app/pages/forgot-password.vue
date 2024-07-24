<template>
  <TwoColumn class="max-w-screen-xl">
    <template #left>
      <VcTypography tag="h1" class="mb-6 lg:mt-5">
        {{ $t("pages.forgot_password.header") }}
      </VcTypography>

      <div v-if="!isSucceeded">
        <div class="mb-4 text-lg md:text-base">
          {{ $t("pages.forgot_password.email_will_be_sended_message") }}
        </div>
        <ForgotPasswordForm @succeeded="onSucceeded()" />
      </div>

      <div v-else class="space-y-10 text-center lg:mt-12 lg:space-y-12 lg:text-left">
        <div class="space-x-0 space-y-10 lg:flex lg:items-center lg:space-x-3 lg:space-y-0">
          <VcIcon class="text-success" name="check-circle" :size="36" />
          <div class="text-lg">{{ $t("pages.forgot_password.reset_link_was_sent_message") }}</div>
        </div>

        <VcButton to="/" class="w-48">
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
