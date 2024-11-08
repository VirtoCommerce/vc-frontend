<template>
  <VcPushMessages
    v-model:show-unread-only="showUnreadOnly"
    :total-count="totalCount"
    :unread-count="unreadCount"
    :items="items"
    removable
    can-view-all
    with-options
    :offset-options="offsetOptions"
    @mark-read-all="markReadAll"
    @mark-unread-all="markUnreadAll"
    @clear-all="clearAll"
    @view-all="$router.push({ name: 'Notifications' })"
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
import { useLocalStorage } from "@vueuse/core";
import { usePushMessages } from "@/modules/push-messages/composables/usePushMessages";
import PushMessage from "./push-message.vue";

interface IProps {
  offsetOptions?: VcPushMessagesOffsetOptionsType;
}

defineProps<IProps>();

const showUnreadOnly = useLocalStorage<boolean>("showUnreadOnly_pushMessages_popup", false);

const { totalCount, unreadCount, items, markReadAll, markUnreadAll, clearAll } = usePushMessages({
  showUnreadOnly,
});
</script>
