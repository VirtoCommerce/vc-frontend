<template>
  <VcPushNotifications :total-count="totalCount" :items="items" options removable :y-offset="yOffset">
    <slot :count="unreadCount" />
  </VcPushNotifications>
</template>

<script setup lang="ts">
import { usePushNotifications } from "@/shared/push-notifications/composables/usePushNotifications";

interface IProps {
  yOffset?: number;
}

defineProps<IProps>();

const { totalCount, unreadCount, items } = usePushNotifications();
</script>
