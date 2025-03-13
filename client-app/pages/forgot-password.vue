<template>
  <VcEmptyPage icon="outline-security" image="sign-in.jpg" :status-color="isSucceeded ? 'success' : 'secondary'">
    <VcTypography tag="h1" class="order-first mb-3">
      {{ $t("pages.forgot_password.header") }}
    </VcTypography>

    <div v-if="!isSucceeded">
      <div class="mb-4 text-base">
        {{ $t("pages.forgot_password.email_will_be_sended_message") }}
      </div>

      <ForgotPasswordForm @succeeded="onSucceeded()" />
    </div>

    <div v-else>
      <div class="mb-5 text-base">{{ $t("pages.forgot_password.reset_link_was_sent_message") }}</div>

      <VcButton to="/" min-width="12rem">
        {{ $t("pages.forgot_password.home_button") }}
      </VcButton>
    </div>
  </VcEmptyPage>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { getHeadInstance } from "@/core/utilities/head";
import { ForgotPasswordForm } from "@/shared/account";

const { t } = useI18n();
const head = getHeadInstance();

usePageHead(
  {
    title: t("pages.forgot_password.meta.title"),
  },
  head,
);

const isSucceeded = ref(false);

function onSucceeded() {
  isSucceeded.value = true;
}
</script>
