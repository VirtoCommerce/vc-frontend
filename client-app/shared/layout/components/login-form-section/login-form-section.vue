<template>
  <section class="banner flex items-center" :style="{ backgroundImage: `url(${bgImage})` }">
    <div class="container mx-auto flex flex-col items-center space-y-10 p-6 md:p-12 lg:flex-row lg:space-x-24">
      <div v-if="!isAuthenticated" class="w-full rounded bg-additional-50 p-6 shadow-lg md:p-10 lg:w-2/5">
        <VcTypography tag="h2" variant="h1" class="mb-8">
          {{ sectionTitle }}
        </VcTypography>

        <EmailOtpSignInForm
          v-if="showEmailOtpForm"
          has-password-authentication
          @switch-to-password="switchToPassword"
          @step-changed="otpStep = $event"
        />

        <template v-else>
          <SignInForm grow-buttons />

          <button
            v-if="hasEmailOtpAuthentication"
            type="button"
            class="mt-4 block text-sm font-bold text-[--link-color] hover:text-[--link-hover-color]"
            @click="switchToOtp"
          >
            {{ $t("shared.sign_in.email_otp_sign_in_form.switch_to_otp_link") }}
          </button>
        </template>
      </div>

      <div class="w-full select-none text-center font-bold text-additional-50 drop-shadow-lg lg:w-3/5 lg:text-left">
        <i18n-t
          keypath="pages.home.main_banner_block.message"
          tag="h1"
          class="mb-8 text-3xl uppercase leading-tight md:text-5xl"
        >
          <template #br><br /></template>
        </i18n-t>

        <div
          class="flex flex-col items-center justify-center space-y-2 text-xl md:flex-row md:space-x-7 md:space-y-0 md:text-2xl lg:justify-start"
        >
          <div>
            {{ $t("pages.home.main_banner_block.key_feature_1") }}
          </div>

          <span class="size-2 shrink-0 rounded-full bg-primary" />

          <div>
            {{ $t("pages.home.main_banner_block.key_feature_2") }}
          </div>

          <span class="size-2 shrink-0 rounded-full bg-primary" />

          <div>
            {{ $t("pages.home.main_banner_block.key_feature_3") }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useThemeContext } from "@/core/composables";
import { SignInForm, useUser } from "@/shared/account";
import { useEmailOtpAuthentication } from "@/shared/sign-in/composables/useEmailOtpAuthentication";
import { getImageUrl } from "@/ui-kit/utilities";
import EmailOtpSignInForm from "@/shared/sign-in/components/email-otp-sign-in-form.vue";

const { t } = useI18n();
const { themeContext } = useThemeContext();
const { isAuthenticated } = useUser();
const { hasEmailOtpAuthentication } = useEmailOtpAuthentication();

const bgImage = computed(() =>
  themeContext.value.settings.homepage_background_image
    ? getImageUrl(themeContext.value.settings.homepage_background_image)
    : "none",
);

const signInMode = ref<"password" | "otp">(hasEmailOtpAuthentication.value ? "otp" : "password");
const showEmailOtpForm = computed(() => hasEmailOtpAuthentication.value && signInMode.value === "otp");

const otpStep = ref<"request" | "verify" | "locked" | "generic">("request");

function switchToOtp() {
  otpStep.value = "request";
  signInMode.value = "otp";
}

function switchToPassword() {
  otpStep.value = "request";
  signInMode.value = "password";
}

const sectionTitle = computed(() =>
  showEmailOtpForm.value && otpStep.value === "verify"
    ? t("shared.sign_in.email_otp_sign_in_form.verify.header")
    : t("pages.home.sign_in_form_title"),
);
</script>

<style scoped>
.banner {
  position: relative;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  min-height: 549px;
}
</style>
