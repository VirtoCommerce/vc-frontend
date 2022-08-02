<template>
  <TwoColumn class="max-w-screen-xl">
    <template #left>
      <h1 class="uppercase text-3xl font-bold mb-5 lg:mt-5" v-t="`pages.${localizationPageTerm}.header`"></h1>
      <div v-if="isMounted">
        <div v-if="tokenDataIsValid">
          <div v-if="!isSucceeded">
            <div
              class="text-lg md:text-base mb-5 lg:mb-4"
              v-t="`pages.${localizationPageTerm}.enter_new_password_message`"
            ></div>
            <ResetPasswordForm
              :user-id="userId"
              :token="token"
              :kind="isResetRoute ? 'reset' : 'set'"
              @succeeded="onSucceeded()"
            ></ResetPasswordForm>
          </div>
          <div v-else class="flex flex-col items-center space-y-10 lg:space-y-12 lg:items-start lg:mt-12">
            <div class="flex flex-col items-center lg:flex-row space-x-0 space-y-10 lg:space-x-3 lg:space-y-0">
              <i class="fas fa-check-circle text-7xl lg:text-4xl text-green-600"></i>
              <div class="text-lg" v-t="`pages.${localizationPageTerm}.success_message`"></div>
            </div>

            <VcButton :to="{ name: 'SignIn' }" class="w-48 uppercase">
              {{ $t(`pages.${localizationPageTerm}.log_in_button`) }}
            </VcButton>
          </div>
        </div>
        <div v-else class="flex flex-col items-center space-y-10 lg:space-y-12 lg:items-start lg:mt-12">
          <div class="flex flex-col items-center lg:flex-row space-x-0 space-y-10 lg:space-x-3 lg:space-y-0">
            <i class="fas fa-times-circle text-7xl lg:text-4xl text-[color:var(--color-danger)]"></i>
            <div class="text-lg" v-t="`pages.${localizationPageTerm}.data_invalid_error_message`"></div>
          </div>

          <VcButton to="/" class="w-48 uppercase">
            {{ $t(`pages.${localizationPageTerm}.home_button`) }}
          </VcButton>
        </div>
      </div>
    </template>
    <template #right>
      <VcImage
        class="max-w-md"
        :src="isResetRoute ? '/static/images/sign-in/sign-in-page-image.webp' : '/static/images/sign-up/image.webp'"
        lazy
      />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { TwoColumn } from "@/shared/layout";
import { ResetPasswordForm } from "@/shared/account";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";

const route = useRoute();
const { t } = useI18n();

usePageHead({
  title: t("pages.reset_password.meta.title"),
});

const userId = route.query.userId?.valueOf() as string;
const token = route.query.token?.valueOf() as string;

const isResetRoute = route.name == "ResetPassword";
const localizationPageTerm = computed(() => (isResetRoute ? "reset_password" : "set_password"));

const isSucceeded = ref(false);
const isMounted = ref(false);
const tokenDataIsValid = ref(true);

onMounted(async () => {
  if (!userId || !token) {
    tokenDataIsValid.value = false;
  }

  isMounted.value = true;
});

function onSucceeded() {
  isSucceeded.value = true;
}
</script>
