<template>
  <div>
    <VcTypography tag="h1">
      {{ $t("pages.account.change_password.title") }}
    </VcTypography>

    <VcWidget size="lg">
      <ChangePasswordForm class="lg:w-1/2" @succeeded="onSucceeded" />
    </VcWidget>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { DEFAULT_NOTIFICATION_DURATION } from "@/core/constants";
import { ChangePasswordForm } from "@/shared/account";
import { useNotifications } from "@/shared/notification";

const { t } = useI18n();
const notifications = useNotifications();

function onSucceeded() {
  notifications.success({
    duration: DEFAULT_NOTIFICATION_DURATION,
    text: t("pages.account.change_password.success_message"),
  });
}
</script>
