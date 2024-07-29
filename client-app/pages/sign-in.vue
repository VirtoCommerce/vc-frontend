<template>
  <TwoColumn class="sign-in" breakpoint="md" :always-show-right="hasIdentityProviders && !hasOnlyIdentityProviders">
    <template #left>
      <VcTypography tag="h1" class="sign-in__title">
        {{ $t("pages.sign_in.header") }}
      </VcTypography>

      <SignInForm v-if="hasPasswordAuthentication" class="sign-in__form" />
      <IdentityProviders
        v-if="hasOnlyIdentityProviders"
        :providers="identityProviders"
        class="sign-in__providers sign-in__providers--left"
      />
    </template>
    <div v-if="hasIdentityProviders && hasPasswordAuthentication" class="sign-in__divider">
      {{ $t("pages.sign_in.divider_text") }}
    </div>
    <template #right>
      <VcImage
        v-if="!hasIdentityProviders || hasOnlyIdentityProviders"
        :alt="$t('common.labels.background_image')"
        class="sign-in__image"
        src="/static/images/sign-in/sign-in-page-image.webp"
        lazy
      />
      <template v-if="hasIdentityProviders && !hasOnlyIdentityProviders">
        <IdentityProviders class="sign-in__providers sign-in__providers--right" :providers="identityProviders" />
      </template>
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead, useThemeContext } from "@/core/composables";
import { SignInForm } from "@/shared/account";
import { TwoColumn } from "@/shared/layout";

const PASSWORD_AUTHENTICATION_TYPE = "Password";

const IdentityProviders = defineAsyncComponent(() => import("@/shared/sign-in/components/identity-providers.vue"));

const { themeContext } = useThemeContext();

const authenticationTypes: string[] = themeContext.value.storeSettings?.authenticationTypes || [
  PASSWORD_AUTHENTICATION_TYPE,
];

const identityProviders = computed(() =>
  authenticationTypes.filter((type: string) => type !== PASSWORD_AUTHENTICATION_TYPE),
);

const hasIdentityProviders = computed(() => identityProviders.value.length > 0);
const hasOnlyIdentityProviders = computed(() => hasIdentityProviders.value && !hasPasswordAuthentication.value);
const hasPasswordAuthentication = computed(() => {
  return authenticationTypes.includes(PASSWORD_AUTHENTICATION_TYPE);
});

const { t } = useI18n();

usePageHead({
  title: t("pages.sign_in.meta.title"),
});
</script>

<style lang="scss">
.sign-in {
  @apply max-w-screen-xl;

  &__title {
    @apply mb-4 text-center;

    @media (width > theme("screens.md")) {
      @apply mb-6 text-left;
    }
  }

  &__divider {
    @apply relative flex flex-col items-center uppercase;

    @media (width > theme("screens.md")) {
      @apply flex-row;
    }

    &::before,
    &::after {
      @apply content-[''] absolute h-px w-[calc(50%-2rem)] top-1/2 bg-neutral-300;

      @media (width > theme("screens.md")) {
        @apply h-[calc(50%-2rem)] w-px;
      }
    }

    &::before {
      @apply left-0;

      @media (width > theme("screens.md")) {
        @apply top-2 left-1/2;
      }
    }

    &::after {
      @apply right-0;

      @media (width > theme("screens.md")) {
        @apply top-auto bottom-2 left-1/2;
      }
    }
  }

  &__image {
    @apply max-w-md;
  }

  &__providers {
    @apply mx-auto;

    @media (width > theme("screens.md")) {
      @apply ml-0;
    }

    &--left {
      @apply mt-9 max-w-80 w-full;
    }

    &--right {
      @apply h-full max-w-72;
    }
  }
}
</style>
