<template>
  <TwoColumn class="max-w-screen-xl">
    <template #left>
      <VcTypography tag="h1" class="mb-8">
        {{ $t("pages.change_password.header") }}
      </VcTypography>

      <div v-if="!isSucceeded">
        <ChangePasswordForm @succeeded="onSucceeded()" />
      </div>

      <div v-else class="flex flex-col items-center gap-10 lg:flex-row lg:gap-3">
        <VcIcon class="fill-success" name="check-circle" :size="36" />

        <div class="text-lg">{{ $t("pages.change_password.success_message") }}</div>
      </div>
    </template>

    <template #right>
      <VcImage class="max-w-md" src="sign-in-page-image.webp" lazy />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { ChangePasswordForm } from "@/shared/account";
import { openReturnUrl, TabsType, useBroadcast } from "@/shared/broadcast";
import { TwoColumn } from "@/shared/layout";

const { t } = useI18n();
const broadcast = useBroadcast();

usePageHead({
  title: t("pages.change_password.meta.title"),
});

const isSucceeded = ref(false);

function onSucceeded() {
  isSucceeded.value = true;
  void broadcast.emit(openReturnUrl, undefined, TabsType.ALL);
}
</script>
