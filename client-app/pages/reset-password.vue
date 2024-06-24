<template>
  <TwoColumn class="max-w-screen-xl">
    <template #left>
      <VcTypography tag="h1" class="lg:mt-5">
        {{ $t(`pages.${localizationPageTerm}.header`) }}
      </VcTypography>

      <template v-if="isValidData">
        <template v-if="!isSucceeded">
          <p class="mb-5 text-lg md:text-base lg:mb-4">
            {{ $t(`pages.${localizationPageTerm}.enter_new_password_message`) }}
          </p>

          <ResetPasswordForm
            :user-id="userId"
            :token="token"
            :mode="isResetMode ? 'reset' : 'set'"
            @succeeded="onSucceeded()"
          />
        </template>

        <div v-else class="space-y-10 text-center lg:mt-12 lg:space-y-12 lg:text-left">
          <div class="space-x-0 space-y-10 lg:flex lg:items-center lg:space-x-3 lg:space-y-0">
            <VcIcon class="text-[--color-success-500]" name="check-circle" :size="36" />
            <p class="text-lg">
              {{ $t(`pages.${localizationPageTerm}.success_message`) }}
            </p>
          </div>

          <VcButton :to="{ name: 'SignIn' }" class="w-48">
            {{ $t(`pages.${localizationPageTerm}.log_in_button`) }}
          </VcButton>
        </div>
      </template>

      <div v-else class="space-y-10 text-center lg:mt-12 lg:space-y-12 lg:text-left">
        <div class="space-x-0 space-y-10 lg:flex lg:items-center lg:space-x-3 lg:space-y-0">
          <VcIcon class="text-[--color-danger-500]" name="x-circle" :size="36" />
          <p class="text-lg">
            {{ $t("common.messages.invalid_user_id_or_token") }}
          </p>
        </div>

        <VcButton to="/" class="w-48">
          {{ $t("common.buttons.home") }}
        </VcButton>
      </div>
    </template>

    <template #right>
      <VcImage
        class="max-w-md"
        :src="isResetMode ? '/static/images/sign-in/sign-in-page-image.webp' : '/static/images/sign-up/image.webp'"
        lazy
      />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { usePageHead, useRouteQueryParam } from "@/core/composables";
import { ResetPasswordForm } from "@/shared/account";
import { TwoColumn } from "@/shared/layout";

const route = useRoute();
const { t } = useI18n();

usePageHead({
  title: t("pages.reset_password.meta.title"),
});

const isSucceeded = ref(false);

const userId = useRouteQueryParam<string>("userId");
const token = useRouteQueryParam<string>("token");

const isValidData = computed<boolean>(() => Boolean(userId.value && token.value));
const isResetMode = computed<boolean>(() => route.name === "ResetPassword");
const localizationPageTerm = computed<string>(() => (isResetMode.value ? "reset_password" : "set_password"));

function onSucceeded() {
  isSucceeded.value = true;
  window.scroll(0, 0);
}
</script>
