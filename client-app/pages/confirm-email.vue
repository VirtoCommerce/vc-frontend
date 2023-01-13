<template>
  <!-- Success -->
  <VcEmptyPage v-if="success" image="/static/images/email.webp" class="flex flex-col grow">
    <template #description>
      <h1 class="text-center lg:text-left text-3xl uppercase font-bold mb-8" v-t="'pages.confirm_email.header'" />

      <div class="flex flex-col lg:flex-row gap-5 mb-10">
        <span
          class="flex items-center justify-center shrink-0 h-12 w-12 rounded-full text-white bg-[color:var(--color-success)]"
        >
          <i class="fa fa-check text-2xl" />
        </span>

        <p class="text-19 text-center lg:text-left max-w-md">
          <strong class="block mb-2" v-t="'pages.confirm_email.subtitle'" />
          {{ $t("pages.confirm_email.text") }}
        </p>
      </div>
    </template>

    <template #actions>
      <VcButton :to="{ name: 'SignIn' }" class="uppercase w-36">
        {{ $t("pages.confirm_email.continue_button") }}
      </VcButton>
    </template>
  </VcEmptyPage>

  <!-- Error -->
  <VcEmptyPage v-else-if="loaded" image="/static/images/email.webp" class="flex flex-col grow">
    <template #description>
      <h1 class="text-center lg:text-left text-3xl uppercase font-bold mb-8" v-t="'pages.confirm_email.header'" />

      <div class="flex flex-col lg:flex-row items-center gap-5 mb-10">
        <span
          class="flex items-center justify-center shrink-0 h-12 w-12 rounded-full text-white bg-[color:var(--color-danger)]"
        >
          <i class="fa fa-exclamation text-2xl" />
        </span>

        <p class="text-19 text-center font-bold lg:text-left max-w-md" v-t="'identity_error.InvalidToken'" />
      </div>
    </template>

    <template #actions>
      <VcButton :to="{ name: 'Catalog' }" class="uppercase w-48">
        {{ $t("pages.confirm_email.continue_shopping_button") }}
      </VcButton>
    </template>
  </VcEmptyPage>

  <!-- Loader -->
  <VcLoaderOverlay v-else no-bg />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { invoke } from "@vueuse/core";
import { usePageHead, useRouteQueryParam } from "@/core";
import { IdentityResultType } from "@/xapi";
import { useUser } from "@/shared/account";

const { t } = useI18n();

usePageHead({
  title: t("pages.confirm_email.meta.title"),
});

const { confirmEmail } = useUser();

const { queryParam: userId } = useRouteQueryParam<string>("UserId");
const { queryParam: token } = useRouteQueryParam<string>("Token");

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
