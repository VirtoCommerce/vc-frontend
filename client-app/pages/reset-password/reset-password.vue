<template>
  <TwoColumn class="max-w-screen-xl">
    <template #left>
      <h1
        class="uppercase tracking-wide text-3xl lg:text-4xl font-bold mb-8 lg:mb-9 lg:mt-6"
        v-t="'pages.reset_password.header'"
      ></h1>
      <div v-if="isMounted">
        <div v-if="tokenDataIsValid">
          <div v-if="!isSucceeded">
            <div class="text-lg md:text-base mb-4" v-t="'pages.reset_password.enter_new_password_message'"></div>
            <ResetPasswordForm :user-id="userId" :token="token" @succeeded="onSucceeded()"></ResetPasswordForm>
          </div>
          <div v-else class="flex flex-col items-center space-y-10 lg:space-y-12 lg:items-start lg:mt-12">
            <div class="flex flex-col items-center lg:flex-row space-x-0 space-y-10 lg:space-x-3 lg:space-y-0">
              <i class="fas fa-check-circle text-7xl lg:text-4xl text-green-600"></i>
              <div class="text-lg" v-t="'pages.reset_password.success_message'"></div>
            </div>

            <VcButton :to="{ name: 'SignIn' }" class="w-48 uppercase">
              {{ $t("pages.reset_password.log_in_button") }}
            </VcButton>
          </div>
        </div>
        <div v-else class="flex flex-col items-center space-y-10 lg:space-y-12 lg:items-start lg:mt-12">
          <div class="flex flex-col items-center lg:flex-row space-x-0 space-y-10 lg:space-x-3 lg:space-y-0">
            <i class="fas fa-times-circle text-7xl lg:text-4xl text-[color:var(--color-danger)]"></i>
            <div class="text-lg" v-t="'pages.reset_password.data_invalid_error_message'"></div>
          </div>

          <VcButton to="/" class="w-48 uppercase">
            {{ $t("pages.reset_password.home_button") }}
          </VcButton>
        </div>
      </div>
    </template>
    <template #right>
      <VcImage class="max-w-md" src="/static/images/sign-in/sign-in-page-image.webp" />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { VcImage, VcButton } from "@/components";
import { TwoColumn } from "@/shared/layout";
import { ResetPasswordForm, useUser } from "@/shared/account";
import { useRoute } from "vue-router";

const route = useRoute();
const { validateToken } = useUser();

const userId = route.query.userId?.valueOf() as string;
const token = route.query.token?.valueOf() as string;

const isSucceeded = ref(false);
const isMounted = ref(false);
const tokenDataIsValid = ref(true);

onMounted(async () => {
  if (!userId || !token) {
    tokenDataIsValid.value = false;
  } else {
    const validateTokenResult = await validateToken({ userId: userId, token: token });
    if (!validateTokenResult.succeeded) {
      tokenDataIsValid.value = false;
    }
  }

  isMounted.value = true;
});

function onSucceeded() {
  isSucceeded.value = true;
}
</script>
