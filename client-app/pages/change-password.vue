<template>
  <VcEmptyPage
    class="sign-in"
    icon="outline-security"
    image="sign-in.jpg"
    hide-mobile-side
    :status-color="isSucceeded ? 'success' : 'secondary'"
  >
    <div class="w-full sm:pe-8 md:pe-16 lg:pe-24">
      <VcTypography tag="h1" class="mb-8">
        {{ $t("pages.change_password.header") }}
      </VcTypography>

      <ChangePasswordForm v-if="!isSucceeded" @succeeded="onSucceeded()" />

      <div v-else class="text-base">
        {{ $t("pages.change_password.success_message") }}
      </div>
    </div>
  </VcEmptyPage>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { ChangePasswordForm } from "@/shared/account";
import { openReturnUrl, TabsType, useBroadcast } from "@/shared/broadcast";

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
