<template>
  <TwoColumn class="sign-in" :always-show-right="hasIdentityProviders">
    <template #left>
      <VcTypography tag="h1" class="sign-in__title">
        {{ $t("pages.sign_in.header") }}
      </VcTypography>

      <SignInForm v-if="hasLoginByEmail" class="sign-in__form" />
    </template>
    <div v-if="hasIdentityProviders && hasLoginByEmail" class="sign-in__divider">OR</div>
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
        <div class="sign-in__providers">
          <VcButton class="grow" variant="outline" color="secondary" @click="externalSignIn">
            <template #prepend>
              <VcImage class="mr-2" :alt="$t('common.labels.addresses_icon')" src="/static/images/sign-in/ms.svg" />
            </template>
            Sign in with Active Directory
          </VcButton>
        </div>
      </template>
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead, useThemeContext } from "@/core/composables";
import { globals } from "@/core/globals";
import { getReturnUrlValue } from "@/core/utilities";
import { SignInForm } from "@/shared/account";
import { TwoColumn } from "@/shared/layout";

const PASSWORD_AUTHENTICATION_TYPE = "Password";

const { themeContext } = useThemeContext();

const authenticationTypes: string[] = themeContext.value.settings.authenticationTypes || [
  PASSWORD_AUTHENTICATION_TYPE,
  "AzureAD",
];

const hasIdentityProviders = computed(
  () => authenticationTypes.filter((type) => type !== PASSWORD_AUTHENTICATION_TYPE).length > 0,
);

const hasLoginByEmail = computed(() => {
  return authenticationTypes.includes(PASSWORD_AUTHENTICATION_TYPE);
});

function externalSignIn() {
  const origin = location.origin;
  const returnUrl = getReturnUrlValue() ?? "/";

  const oidcUrl = new URL("/signin-oidc", origin);

  const callbackUrl = new URL("/callback", origin);
  callbackUrl.searchParams.set("returnUrl", returnUrl);

  const url = new URL("/externalsignin", origin);
  url.searchParams.set("authenticationType", "AzureAD");
  url.searchParams.set("oidcUrl", oidcUrl.href);
  url.searchParams.set("callbackUrl", callbackUrl.href);
  url.searchParams.set("storeId", globals.storeId);

  location.assign(url);
}

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
    @apply relative hidden lg:flex items-center;

    &::before,
    &::after {
      @apply content-[''] absolute left-1/2 w-px h-[calc(50%-2rem)] bg-neutral-300 -translate-x-1/2;
    }

    &::before {
      @apply top-0;
    }

    &::after {
      @apply bottom-0;
    }
  }

  &__image {
    @apply max-w-md;
  }

  &__providers {
    @apply flex h-full max-w-72 items-center gap-5;
  }
}
</style>
