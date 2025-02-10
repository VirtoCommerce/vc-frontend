<template>
  <!-- Success -->
  <VcEmptyPage
    v-if="emailConfirmed || linkSentSuccessfully"
    image="email.jpg"
    icon="outline-e-mail"
    :status-color="emailConfirmed ? 'success' : 'secondary'"
  >
    <VcTypography tag="h1" class="order-first mb-6">
      {{ $t("pages.confirm_email.header") }}
    </VcTypography>

    <div class="mb-10 max-w-md">
      <span v-if="linkSentSuccessfully">
        {{ $t("pages.confirm_email.link_sent_successfully_text") }}
      </span>

      <span v-if="emailConfirmed">
        <div class="mb-2 font-bold">
          {{ $t("pages.confirm_email.subtitle") }}
        </div>

        {{ $t("pages.confirm_email.text") }}
      </span>
    </div>

    <VcButton v-if="linkSentSuccessfully" :to="{ name: 'Home' }" min-width="12rem">
      {{ $t("common.links.home") }}
    </VcButton>

    <VcButton v-else-if="emailConfirmed" :to="{ name: 'SignIn' }" min-width="12rem">
      {{ $t("pages.confirm_email.continue_button") }}
    </VcButton>
  </VcEmptyPage>

  <!-- Error -->
  <VcEmptyPage
    v-else-if="loaded && (!emailConfirmed || !linkSentSuccessfully)"
    image="email.jpg"
    icon="outline-e-mail"
    status-color="danger"
  >
    <VcTypography tag="h1" class="order-first mb-6">
      {{ $t("pages.confirm_email.header") }}
    </VcTypography>

    <div class="mb-10 max-w-md">
      <span v-if="!emailConfirmed">
        {{ $t("pages.confirm_email.email_confirmation_failed_text") }}
      </span>

      <span v-if="linkSentSuccessfully === false">
        {{ $t("pages.confirm_email.link_sent_error_text") }}
      </span>
    </div>

    <VcButton :loading="loading" min-width="12rem" @click="resendLink">
      {{ $t("common.buttons.resend_link") }}
    </VcButton>
  </VcEmptyPage>

  <!-- Loader -->
  <VcLoaderOverlay v-else no-bg />
</template>

<script setup lang="ts">
import { invoke } from "@vueuse/core";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead, useRouteQueryParam } from "@/core/composables";
import { useUser } from "@/shared/account";
import type { CustomIdentityResultType } from "@/core/api/graphql/types";

const { t } = useI18n();

usePageHead({
  title: t("pages.confirm_email.meta.title"),
});

const { confirmEmail, sendVerifyEmail, loading } = useUser();

const userId = useRouteQueryParam<string>("UserId");
const token = useRouteQueryParam<string>("Token");

const loaded = ref(false);
const emailConfirmed = ref(false);
const linkSentSuccessfully = ref<boolean | undefined>();

async function resendLink(): Promise<void> {
  linkSentSuccessfully.value = await sendVerifyEmail(userId.value);

  emailConfirmed.value = false;
}

void invoke(async () => {
  const result: CustomIdentityResultType = await confirmEmail({
    userId: userId.value,
    token: token.value,
  });

  emailConfirmed.value = result.succeeded;
  linkSentSuccessfully.value = undefined;
  loaded.value = true;
});
</script>
