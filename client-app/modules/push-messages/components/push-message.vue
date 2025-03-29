<template>
  <VcPushMessage
    :size="size"
    :push-message="_pushMessage"
    role="button"
    tabindex="0"
    :aria-label="pushMessage.isRead ? $t('push_messages.mark_as_unread') : $t('push_messages.mark_as_read')"
    :title="pushMessage.isRead ? $t('push_messages.mark_as_unread') : $t('push_messages.mark_as_read')"
    @click="handleToggleRead"
    @keypress.enter="handleToggleRead"
  />
</template>

<script setup lang="ts">
import { toRefs } from "vue";
import { usePushMessage } from "../composables/usePushMessage";
import type { PushMessageType } from "@/modules/push-messages/types";
import VcPushMessage from "@/modules/push-messages/components/vc-push-message.vue";

interface IProps {
  pushMessage: PushMessageType;
  size?: "md" | "lg";
}

interface IEmits {
  (e: "toggleRead"): void;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();
const { pushMessage: _pushMessage } = toRefs(props);

const { toggleRead } = usePushMessage(_pushMessage);

async function handleToggleRead() {
  await toggleRead();
  emit("toggleRead");
}
</script>
