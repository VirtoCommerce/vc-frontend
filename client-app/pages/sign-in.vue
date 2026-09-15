<template>
  <VcEmptyPage class="sign-in" icon="outline-security" image="sign-in.jpg">
    <div class="sign-in__form">
      <VcTypography tag="h1" class="sign-in__title">
        {{ pageTitle }}
      </VcTypography>

      <EmailOtpSignInForm
        v-if="showEmailOtpForm"
        :has-password-authentication="hasPasswordAuthentication"
        @switch-to-password="switchToPassword"
        @step-changed="otpStep = $event"
      />

      <template v-else>
        <SignInForm v-if="hasPasswordAuthentication" />

        <button
          v-if="hasEmailOtpAuthentication"
          type="button"
          class="sign-in__switch-link"
          data-test-id="email-otp-switch-to-otp-link"
          @click="switchToOtp"
        >
          {{ $t("shared.sign_in.email_otp_sign_in_form.switch_to_otp_link") }}
        </button>
      </template>
    </div>

    <IdentityProviders
      v-if="hasIdentityProviders && !hasSignInForm"
      :providers="identityProviders"
      :return-url="returnUrl"
      class="sign-in__providers sign-in__providers--only"
    />

    <template v-if="hasIdentityProviders && hasSignInForm" #side>
      <div class="sign-in__side">
        <SignInDivider>{{ $t("pages.sign_in.divider_text") }}</SignInDivider>

        <IdentityProviders :providers="identityProviders" :return-url="returnUrl" class="sign-in__providers" />
      </div>
    </template>
  </VcEmptyPage>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { usePageHead, useReturnUrl } from "@/core/composables";
import { SignInForm } from "@/shared/account";
import { useEmailOtpAuthentication } from "@/shared/sign-in/composables/useEmailOtpAuthentication";
import { useIdentityProviders } from "@/shared/sign-in/composables/useIdentityProviders";
import { useOtpSignInMode } from "@/shared/sign-in/composables/useOtpSignInMode";
import EmailOtpSignInForm from "@/shared/sign-in/components/email-otp-sign-in-form.vue";
import SignInDivider from "@/shared/sign-in/components/sign-in-divider.vue";

const IdentityProviders = defineAsyncComponent(() => import("@/shared/sign-in/components/identity-providers.vue"));

const { t } = useI18n();
const { identityProviders, hasIdentityProviders, hasPasswordAuthentication } = useIdentityProviders();
const { getReturnUrl } = useReturnUrl();
const route = useRoute();

const returnUrl = computed<string>(() => getReturnUrl(route.fullPath));

const { hasEmailOtpAuthentication } = useEmailOtpAuthentication();
const { showEmailOtpForm, otpStep, switchToOtp, switchToPassword } = useOtpSignInMode(hasEmailOtpAuthentication);

// hasOnlyIdentityProviders (from useIdentityProviders) doesn't know about OTP, so it can't
// tell "only providers" from "providers + OTP" — this page derives its own, OTP-aware version.
const hasSignInForm = computed(() => hasPasswordAuthentication.value || hasEmailOtpAuthentication.value);

const pageTitle = computed(() =>
  showEmailOtpForm.value && otpStep.value === "verify"
    ? t("shared.sign_in.email_otp_sign_in_form.verify.header")
    : t("pages.sign_in.header"),
);

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

  &__switch-link {
    @apply mt-6 block text-sm font-bold text-[--link-color];

    &:hover {
      @apply text-[--link-hover-color];
    }
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
