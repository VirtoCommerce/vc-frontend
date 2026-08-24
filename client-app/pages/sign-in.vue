<template>
  <VcEmptyPage class="sign-in" icon="outline-security" image="sign-in.jpg">
    <div class="sign-in__form">
      <VcTypography tag="h1" class="sign-in__title">
        {{ $t("pages.sign_in.header") }}
      </VcTypography>

      <SignInForm v-if="hasPasswordAuthentication" />
    </div>

    <IdentityProviders
      v-if="hasOnlyIdentityProviders"
      :providers="identityProviders"
      :return-url="getReturnUrl()"
      class="sign-in__providers sign-in__providers--only"
    />

    <template v-if="hasIdentityProviders && !hasOnlyIdentityProviders" #side>
      <div class="sign-in__side">
        <SignInDivider>{{ $t("pages.sign_in.divider_text") }}</SignInDivider>

        <IdentityProviders :providers="identityProviders" :return-url="getReturnUrl()" class="sign-in__providers" />
      </div>
    </template>
  </VcEmptyPage>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead, useReturnUrl } from "@/core/composables";
import { SignInForm } from "@/shared/account";
import { useIdentityProviders } from "@/shared/sign-in/composables/useIdentityProviders";

const IdentityProviders = defineAsyncComponent(() => import("@/shared/sign-in/components/identity-providers.vue"));
const SignInDivider = defineAsyncComponent(() => import("@/shared/sign-in/components/sign-in-divider.vue"));

const { identityProviders, hasIdentityProviders, hasOnlyIdentityProviders, hasPasswordAuthentication } =
  useIdentityProviders();
const { getReturnUrl } = useReturnUrl();

const { t } = useI18n();

usePageHead({
  title: t("pages.sign_in.meta.title"),
});
</script>

<style lang="scss">
.sign-in {
  &__form {
    @apply order-first w-full;

    @media (width > theme("screens.sm")) {
      @apply pe-8;
    }

    @media (width > theme("screens.lg")) {
      @apply px-16;
    }
  }

  &__title {
    @apply mb-3;
  }

  &__side {
    @apply mt-8 flex w-full flex-col gap-8;

    @media (width > theme("screens.sm")) {
      @apply w-72 flex-row gap-6;
    }

    @media (width > theme("screens.lg")) {
      @apply w-[30rem] gap-16;
    }
  }

  &__image {
    @apply max-w-md;
  }

  &__providers {
    @apply max-sm:mx-auto;

    @media (width > theme("screens.lg")) {
      @apply w-60;
    }

    &--only {
      @media (width > theme("screens.md")) {
        @apply w-[24rem];
      }

      @media (width > theme("screens.lg")) {
        @apply mt-8 ms-16;
      }
    }
  }
}
</style>
