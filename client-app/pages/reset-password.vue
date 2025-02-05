<template>
  <VcEmptyPage
    icon="outline-security"
    :image="isResetMode ? 'sign-in.jpg' : 'reg.jpg'"
    :status-color="statusColor"
    :hide-mobile-side="isValidData && !isSucceeded"
  >
    <div class="w-full sm:pe-12 md:pe-24">
      <VcTypography tag="h1" class="order-first mb-3">
        {{ $t(`pages.${localizationPageTerm}.header`) }}
      </VcTypography>

      <template v-if="isValidData">
        <template v-if="!isSucceeded">
          <div class="mb-4 text-base font-bold">
            {{ $t(`pages.${localizationPageTerm}.enter_new_password_message`) }}
          </div>

          <ResetPasswordForm
            :user-id="userId"
            :token="token"
            :mode="isResetMode ? 'reset' : 'set'"
            class="w-full"
            @succeeded="onSucceeded()"
          />
        </template>

        <template v-else>
          <div class="mb-3 text-base sm:mb-6">
            {{ $t(`pages.${localizationPageTerm}.success_message`) }}
          </div>

          <VcButton :to="{ name: 'SignIn' }" min-width="12rem">
            {{ $t(`pages.${localizationPageTerm}.log_in_button`) }}
          </VcButton>
        </template>
      </template>

      <template v-else>
        <div class="mb-3 text-base font-bold text-danger sm:mb-6">
          {{ $t("common.messages.invalid_user_id_or_token") }}
        </div>

        <VcButton to="/" min-width="12rem">
          {{ $t("common.buttons.home") }}
        </VcButton>
      </template>
    </div>
  </VcEmptyPage>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { usePageHead, useRouteQueryParam } from "@/core/composables";
import { ResetPasswordForm } from "@/shared/account";
import { COLORS } from "@/ui-kit/constants";

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
const statusColor = computed<string>(() => {
  if (!isValidData.value) {
    return COLORS.danger;
  }

  if (isSucceeded.value) {
    return COLORS.success;
  }

  return COLORS.secondary;
});

function onSucceeded() {
  isSucceeded.value = true;
  window.scroll(0, 0);
}
</script>
