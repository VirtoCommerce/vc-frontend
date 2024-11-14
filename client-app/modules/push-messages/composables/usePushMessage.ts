import { useMarkPushMessageRead } from "../api/graphql/mutations/markPushMessageRead";
import { useMarkPushMessageUnread } from "../api/graphql/mutations/markPushMessageUnread";
import type { PushMessageType } from "@/modules/push-messages/types";
import type { Ref } from "vue";

export function usePushMessage(pushMessage: Ref<PushMessageType>) {
  const { mutate: _markRead } = useMarkPushMessageRead();
  async function markRead() {
    await _markRead({ command: { messageId: pushMessage.value.id } });
  }

  const { mutate: _markUnread } = useMarkPushMessageUnread();
  async function markUnread() {
    await _markUnread({ command: { messageId: pushMessage.value.id } });
  }

  async function toggleRead() {
    if (pushMessage.value.isRead) {
      await markUnread();
    } else {
      await markRead();
    }
  }

  return {
    pushMessage,
    markRead,
    markUnread,
    toggleRead,
  };
}
