<template>
  <!-- Success -->
  <VcEmptyPage v-if="success" image="/static/images/email.webp" class="flex grow flex-col">
    <template #description>
      <h1 v-t="'pages.confirm_email.header'" class="mb-8 text-center text-3xl font-bold uppercase lg:text-left" />

      <div class="mb-10 flex flex-col items-center gap-5 lg:flex-row">
        <span
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-success)] text-white"
        >
          <i class="fa fa-check text-2xl" />
        </span>

        <p class="max-w-md text-center text-19 lg:text-left">
          <strong v-t="'pages.confirm_email.subtitle'" class="mb-2 block" />
          {{ $t("pages.confirm_email.text") }}
        </p>
      </div>
    </template>

    <template #actions>
      <VcButton :route="{ name: 'SignIn' }" class="w-36">
        {{ $t("pages.confirm_email.continue_button") }}
      </VcButton>
    </template>
  </VcEmptyPage>

  <!-- Error -->
  <VcEmptyPage v-else-if="loaded" image="/static/images/email.webp" class="flex grow flex-col">
    <template #description>
      <h1 v-t="'pages.confirm_email.header'" class="mb-8 text-center text-3xl font-bold uppercase lg:text-left" />

      <div class="mb-10 flex flex-col items-center gap-5 lg:flex-row">
        <span
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-danger)] text-white"
        >
          <i class="fa fa-exclamation text-2xl" />
        </span>

        <p v-t="'identity_error.InvalidToken'" class="max-w-md text-center text-19 font-bold lg:text-left" />
      </div>
    </template>

    <template #actions>
      <VcButton :route="{ name: 'Catalog' }" class="w-48">
        {{ $t("pages.confirm_email.continue_shopping_button") }}
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
import type { IdentityResultType } from "@/xapi/types";

const { t } = useI18n();

usePageHead({
  title: t("pages.confirm_email.meta.title"),
});

const { confirmEmail } = useUser();

const userId = useRouteQueryParam<string>("UserId");
const token = useRouteQueryParam<string>("Token");

const loaded = ref(false);
const success = ref(false);

invoke(async () => {
  const result: IdentityResultType = await confirmEmail({
    userId: userId.value,
    token: token.value,
  });

  success.value = result.succeeded;
  loaded.value = true;
});
</script>
