import { computed } from "vue";
import { useClearAllPushMessages } from "@/core/api/graphql/push-messages/mutations/clearAllPushMessages";
import { useMarkAllPushMessagesRead } from "@/core/api/graphql/push-messages/mutations/markAllPushMessagesRead";
import { useMarkAllPushMessagesUnread } from "@/core/api/graphql/push-messages/mutations/markAllPushMessagesUnread";
import { useGetPushMessages } from "@/core/api/graphql/push-messages/queries/getPushMessages";

export function usePushMessages() {
  const { result } = useGetPushMessages();

  const totalCount = computed(() => items.value.length);
  const unreadCount = computed(() => result.value?.pushMessages.unreadCount ?? 0);
  const items = computed<VcPushMessageType[]>(() => result.value?.pushMessages.items ?? []);

  const { mutate: markReadAll } = useMarkAllPushMessagesRead();
  const { mutate: markUnreadAll } = useMarkAllPushMessagesUnread();
  const { mutate: clearAll } = useClearAllPushMessages();

  return {
    totalCount,
    unreadCount,
    items,
    markReadAll,
    markUnreadAll,
    clearAll,
  };
}
