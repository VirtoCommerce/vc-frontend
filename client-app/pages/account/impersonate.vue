<template>
  <VcEmptyPage class="impersonate-page" icon="outline-security" image="sign-in.jpg">
    <div v-if="!userId" class="impersonate-page__error">
      <VcAlert color="danger" variant="outline-dark" size="md" icon>
        {{ $t("pages.account.impersonate.errors.invalid_user_id") }}
      </VcAlert>

      <VcButton class="impersonate-page__back" @click="goHome">
        {{ $t("pages.account.impersonate.back_to_home") }}
      </VcButton>
    </div>

    <SecurityVerificationForm v-else :target-user-id="userId" @success="onSuccess" @cancel="onCancel" />
  </VcEmptyPage>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { usePageHead } from "@/core/composables";
import { SecurityVerificationForm } from "@/shared/account";

interface IProps {
  userId: string;
}

defineProps<IProps>();

const router = useRouter();
const { t } = useI18n();

usePageHead({
  title: t("pages.account.impersonate.title"),
});

function goHome(): void {
  void router.push("/");
}

function onCancel(): void {
  goHome();
}

function onSuccess(): void {
  // useImpersonate handles broadcast and reload; nothing extra to do here.
}
</script>

<style lang="scss">
.impersonate-page {
  &__error {
    @apply mx-auto flex w-full max-w-md flex-col gap-4 text-start;
  }

  &__back {
    @apply self-start;
  }
}
</style>
