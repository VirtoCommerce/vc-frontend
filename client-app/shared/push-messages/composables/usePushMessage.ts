import { useMarkReadPushMessage } from "@/core/api/graphql/push-messages/mutations/markReadPushMessage";
import { useMarkUnreadPushMessage } from "@/core/api/graphql/push-messages/mutations/markUnreadPushMessage";
import type { Ref } from "vue";

export function usePushMessage(pushMessage: Ref<VcPushMessageType>) {
  const { mutate: _markRead } = useMarkReadPushMessage();
  async function markRead() {
    await _markRead({ command: { messageId: pushMessage.value.id } });
  }

  const { mutate: _markUnread } = useMarkUnreadPushMessage();
  async function markUnread() {
    await _markUnread({ command: { messageId: pushMessage.value.id } });
  }

  async function toggleRead() {
    if (pushMessage.value.read) {
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
