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
      class="sign-in__providers sign-in__providers--only"
    />

    <template v-if="hasIdentityProviders && !hasOnlyIdentityProviders" #side>
      <div class="sign-in__side">
        <div class="sign-in__divider">
          {{ $t("pages.sign_in.divider_text") }}
        </div>

        <IdentityProviders :providers="identityProviders" class="sign-in__providers" />
      </div>
    </template>
  </VcEmptyPage>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead, useThemeContext } from "@/core/composables";
import { getHeadInstance } from "@/core/utilities/head";
import { SignInForm } from "@/shared/account";

const PASSWORD_AUTHENTICATION_TYPE = "Password";

const IdentityProviders = defineAsyncComponent(() => import("@/shared/sign-in/components/identity-providers.vue"));

const { themeContext } = useThemeContext();
const authenticationTypes: string[] = themeContext.value.storeSettings?.authenticationTypes?.length
  ? (themeContext.value.storeSettings.authenticationTypes as string[])
  : [PASSWORD_AUTHENTICATION_TYPE];

const identityProviders = computed(() =>
  authenticationTypes.filter((type: string) => type !== PASSWORD_AUTHENTICATION_TYPE),
);

const hasIdentityProviders = computed(() => identityProviders.value.length > 0);
const hasOnlyIdentityProviders = computed(() => hasIdentityProviders.value && !hasPasswordAuthentication.value);
const hasPasswordAuthentication = computed(() => {
  return authenticationTypes.includes(PASSWORD_AUTHENTICATION_TYPE);
});

const { t } = useI18n();
const head = getHeadInstance();

usePageHead(
  {
    title: t("pages.sign_in.meta.title"),
  },
  head,
);
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

  &__divider {
    @apply relative flex flex-col items-center uppercase;

    @media (width > theme("screens.sm")) {
      @apply flex-row;
    }

    &::before,
    &::after {
      @apply content-[''] absolute h-px w-[calc(50%-2rem)] top-1/2 bg-neutral-300;

      @media (width > theme("screens.sm")) {
        @apply h-[calc(50%-2rem)] w-px;
      }
    }

    &::before {
      @apply left-0;

      @media (width > theme("screens.sm")) {
        @apply top-2 left-1/2;
      }
    }

    &::after {
      @apply right-0;

      @media (width > theme("screens.sm")) {
        @apply top-auto bottom-2 left-1/2;
      }
    }
  }

  &__image {
    @apply max-w-md;
  }

  &__providers {
    @apply max-sm:mx-auto;

    @media (width > theme("screens.lg")) {
      @apply w-56;
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
