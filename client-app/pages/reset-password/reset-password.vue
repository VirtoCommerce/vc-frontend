<template>
  <TwoColumn class="max-w-screen-xl">
    <template #left>
      <h1 class="uppercase tracking-wide text-3xl lg:text-4xl font-bold mb-8 lg:mb-9 lg:mt-6">reset your password</h1>
      <div v-if="isMounted">
        <div v-if="tokenDataIsValid">
          <div v-if="!isSucceeded">
            <div class="text-lg md:text-base mb-4">Enter a new password</div>
            <ResetPasswordForm :user-id="userId" :token="token" @succeeded="onSucceeded()"></ResetPasswordForm>
          </div>
          <div v-else class="flex flex-col items-center space-y-10 lg:space-y-12 lg:items-start lg:mt-12">
            <div class="flex flex-col items-center lg:flex-row space-x-0 space-y-10 lg:space-x-3 lg:space-y-0">
              <i class="fas fa-check-circle text-7xl lg:text-4xl text-green-600"></i>
              <div class="text-lg">Password was successfully changed</div>
            </div>
            <VcButton to="/sign-in" class="w-48 uppercase">Log in</VcButton>
          </div>
        </div>
        <div v-else class="flex flex-col items-center space-y-10 lg:space-y-12 lg:items-start lg:mt-12">
          <div class="flex flex-col items-center lg:flex-row space-x-0 space-y-10 lg:space-x-3 lg:space-y-0">
            <i class="fas fa-times-circle text-7xl lg:text-4xl text-red-500"></i>
            <div class="text-lg">User ID or token is invalid.</div>
          </div>
          <VcButton to="/" class="w-48 uppercase">Home page</VcButton>
        </div>
      </div>
    </template>
    <template #right>
      <img class="max-w-md" src="/assets/static/images/sign-in/sign-in-page-image.webp" />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { TwoColumn } from "@/shared/layout";
import { ResetPasswordForm, useUser } from "@/shared/account";
import { useRoute } from "vue-router";
import { Button as VcButton } from "@/components";

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
