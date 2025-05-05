<template>
  <VcPushMessages
    ref="pushMessagesRef"
    v-model:show-unread-only="showUnreadOnly"
    :total-count="totalCount"
    :unread-count="unreadCount"
    :items="items"
    removable
    can-view-all
    with-options
    :offset-options="offsetOptions"
    close-on-blur
    @mark-read-all="markReadAll"
    @mark-unread-all="markUnreadAll"
    @clear-all="clearAll"
    @view-all="$router.push({ name: 'Notifications' })"
  >
    <template #trigger>
      <slot name="trigger" :total-count="totalCount" :unread-count="unreadCount" />
    </template>

    <template #items>
      <PushMessage
        v-for="(item, index) in items"
        :key="item.id"
        :push-message="item"
        @toggle-read="handleToggleRead(index)"
      />
    </template>
  </VcPushMessages>
</template>

<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { usePushMessages } from "@/modules/push-messages/composables/usePushMessages";
import PushMessage from "./push-message.vue";
import VcPushMessages from "@/modules/push-messages/components/vc-push-messages.vue";

interface IProps {
  offsetOptions?: VcPopoverOffsetOptionsType;
}

defineProps<IProps>();

const showUnreadOnly = useLocalStorage<boolean>("showUnreadOnly_pushMessages_popup", false);

const { totalCount, unreadCount, items, markReadAll, markUnreadAll, clearAll } = usePushMessages({
  showUnreadOnly,
});

/**
 * Handles toggling the read status of a push message.
 * When a push message is marked as read by pressing enter, the focus will move to the next line.
 * If there is no next line, the focus will move to the footer.
 *
 * @param {number} index - The index of the push message to toggle.
 */
function handleToggleRead(index: number) {
  const nextElement = document.querySelector(`.vc-push-messages__items .vc-push-message:nth-child(${index + 2})`);
  if (nextElement instanceof HTMLElement) {
    nextElement.focus();
    return;
  }

  const footerElement = document.querySelector(".vc-push-messages__foot");
  if (footerElement instanceof HTMLElement) {
    footerElement.focus();
  }
}
</script>
