<template>
  <VcPushMessages
    :total-count="totalCount"
    :unread-count="unreadCount"
    :items="items"
    removable
    with-options
    :y-offset="yOffset"
    @mark-read-all="markReadAll"
    @mark-unread-all="markUnreadAll"
    @clear-all="clearAll"
  >
    <template #trigger>
      <slot name="trigger" :total-count="totalCount" :unread-count="unreadCount" />
    </template>
    <template #items>
      <PushMessage v-for="item in items" :key="item.id" :push-message="item" />
    </template>
  </VcPushMessages>
</template>

<script setup lang="ts">
import { usePushMessages } from "@/shared/push-messages/composables/usePushMessages";
import PushMessage from "@/shared/push-messages/components/push-message.vue";

interface IProps {
  yOffset?: number;
}

defineProps<IProps>();

const { totalCount, unreadCount, items, markReadAll, markUnreadAll, clearAll } = usePushMessages();
</script>
