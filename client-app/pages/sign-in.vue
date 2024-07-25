<template>
  <TwoColumn class="sign-in" breakpoint="md" :always-show-right="hasIdentityProviders">
    <template #left>
      <VcTypography tag="h1" class="sign-in__title">
        {{ $t("pages.sign_in.header") }}
      </VcTypography>

      <SignInForm v-if="hasPasswordAuthentication" class="sign-in__form" />
      <IdentityProviders
        v-else-if="hasIdentityProviders"
        :providers="identityProviders"
        class="sign-in__providers sign-in__providers--left"
      />
    </template>
    <div v-if="hasIdentityProviders && hasPasswordAuthentication" class="sign-in__divider">OR</div>
    <!-- use I18n                                      ^^^ -->
    <template #right>
      <VcImage
        v-if="!hasIdentityProviders"
        :alt="$t('common.labels.background_image')"
        class="sign-in__image"
        src="/static/images/sign-in/sign-in-page-image.webp"
        lazy
      />
      <template v-else>
        <IdentityProviders
          v-if="hasPasswordAuthentication"
          class="sign-in__providers sign-in__providers--right"
          :providers="identityProviders"
        />
      </template>
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { SignInForm } from "@/shared/account";
import { TwoColumn } from "@/shared/layout";

const PASSWORD_AUTHENTICATION_TYPE = "Password";
const IdentityProviders = defineAsyncComponent(() => import("@/shared/sign-in/components/identity-providers.vue"));

// const { themeContext } = useThemeContext();

const authenticationTypes: string[] = [PASSWORD_AUTHENTICATION_TYPE, "AzureAD"];

const identityProviders = computed(() => authenticationTypes.filter((type) => type !== PASSWORD_AUTHENTICATION_TYPE));

const hasIdentityProviders = computed(() => identityProviders.value.length > 0);

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
    @apply mb-6 lg:mt-5;
  }

  &__divider {
    @apply relative flex flex-col md:flex-row items-center;

    &::before,
    &::after {
      @apply content-[''] absolute md:left-1/2 max-md:top-1/2 md:w-px h-px md:h-[calc(50%-4rem)] w-[calc(50%-2rem)] bg-neutral-300;
    }

    &::before {
      @apply md:top-4 max-md:left-0;
    }

    &::after {
      @apply md:bottom-4 right-0;
    }
  }

  &__image {
    @apply max-w-md;
  }

  &__providers {
    @apply md:m-0 mx-auto;

    &--left {
      @apply mt-9 max-w-80 w-full;
    }

    &--right {
      @apply h-full max-w-72;
    }
  }
}
</style>
