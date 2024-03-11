<template>
  <VcPushMessages :total-count="totalCount" :items="items" options removable :y-offset="yOffset">
    <slot :count="unreadCount" />
  </VcPushMessages>
</template>

<script setup lang="ts">
import { usePushMessages } from "@/shared/push-messages/composables/usePushMessages";

interface IProps {
  yOffset?: number;
}

defineProps<IProps>();

const { totalCount, unreadCount, items } = usePushMessages();
</script>
