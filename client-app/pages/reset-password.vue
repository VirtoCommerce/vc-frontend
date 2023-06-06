<template>
  <TwoColumn class="max-w-screen-xl">
    <template #left>
      <h1 v-t="`pages.${localizationPageTerm}.header`" class="mb-5 text-3xl font-bold uppercase lg:mt-5 lg:text-4xl" />

      <template v-if="isValidData">
        <template v-if="!isSucceeded">
          <p
            v-t="`pages.${localizationPageTerm}.enter_new_password_message`"
            class="mb-5 text-lg md:text-base lg:mb-4"
          />

          <ResetPasswordForm
            :user-id="userId"
            :token="token"
            :mode="isResetMode ? 'reset' : 'set'"
            @succeeded="onSucceeded()"
          />
        </template>

        <div v-else class="flex flex-col items-center space-y-10 lg:mt-12 lg:items-start lg:space-y-12">
          <div class="flex flex-col items-center space-x-0 space-y-10 lg:flex-row lg:space-x-3 lg:space-y-0">
            <i class="fas fa-check-circle text-7xl text-green-600 lg:text-4xl" />
            <p v-t="`pages.${localizationPageTerm}.success_message`" class="text-lg" />
          </div>

          <VcButton :route="{ name: 'SignIn' }" class="w-48">
            {{ $t(`pages.${localizationPageTerm}.log_in_button`) }}
          </VcButton>
        </div>
      </template>

      <div v-else class="flex flex-col items-center space-y-10 lg:mt-12 lg:items-start lg:space-y-12">
        <div class="flex flex-col items-center space-x-0 space-y-10 lg:flex-row lg:space-x-3 lg:space-y-0">
          <i class="fas fa-times-circle text-7xl text-[color:var(--color-danger)] lg:text-4xl" />
          <p v-t="'common.messages.invalid_user_id_or_token'" class="text-lg" />
        </div>

        <VcButton route="/" class="w-48">
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
