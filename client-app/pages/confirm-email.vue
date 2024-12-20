<template>
  <!-- Success -->
  <VcEmptyPage v-if="emailConfirmed || linkSentSuccessfully" image="email.webp" class="flex grow flex-col">
    <template #description>
      <VcTypography tag="h1" class="mb-6 text-center lg:text-left">
        {{ $t("pages.confirm_email.header") }}
      </VcTypography>

      <div class="mb-10 flex flex-col items-center gap-5 lg:flex-row">
        <VcIcon name="check" size="xxl" class="fill-success" />

        <p class="max-w-md text-center text-lg lg:text-left">
          <span v-if="linkSentSuccessfully">
            {{ $t("pages.confirm_email.link_sent_successfully_text") }}
          </span>

          <span v-if="emailConfirmed">
            <strong class="mb-2 block">
              {{ $t("pages.confirm_email.subtitle") }}
            </strong>

            {{ $t("pages.confirm_email.text") }}
          </span>
        </p>
      </div>
    </template>

    <template #actions>
      <VcButton v-if="linkSentSuccessfully" :to="{ name: 'Home' }" class="w-36">
        {{ $t("common.links.home") }}
      </VcButton>

      <VcButton v-else-if="emailConfirmed" :to="{ name: 'SignIn' }" class="w-36">
        {{ $t("pages.confirm_email.continue_button") }}
      </VcButton>
    </template>
  </VcEmptyPage>

  <!-- Error -->
  <VcEmptyPage
    v-else-if="loaded && (!emailConfirmed || !linkSentSuccessfully)"
    image="email.webp"
    class="flex grow flex-col"
  >
    <template #description>
      <VcTypography tag="h1" class="mb-6 text-center lg:text-left">
        {{ $t("pages.confirm_email.header") }}
      </VcTypography>

      <div class="mb-10 flex flex-col items-center gap-5 lg:flex-row">
        <VcIcon name="exclamation-circle" size="xxl" class="fill-danger" />

        <p class="max-w-md text-center text-lg font-bold lg:text-left">
          <span v-if="!emailConfirmed">
            {{ $t("pages.confirm_email.email_confirmation_failed_text") }}
          </span>

          <span v-if="linkSentSuccessfully === false">
            {{ $t("pages.confirm_email.link_sent_error_text") }}
          </span>
        </p>
      </div>
    </template>

    <template #actions>
      <VcButton :loading="loading" class="w-48" @click="resendLink">
        {{ $t("common.buttons.resend_link") }}
      </VcButton>
    </template>
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
