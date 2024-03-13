import { computed } from "vue";
import { useClearAllPushMessages } from "@/core/api/graphql/push-messages/mutations/clearAllPushMessages";
import { useMarkReadAllPushMessages } from "@/core/api/graphql/push-messages/mutations/markReadAllPushMessages";
import { useMarkUnreadAllPushMessages } from "@/core/api/graphql/push-messages/mutations/markUnreadAllPushMessages";
import { useGetPushMessages } from "@/core/api/graphql/push-messages/queries/getPushMessages";

export function usePushMessages() {
  const { result } = useGetPushMessages();

  const totalCount = computed(() => items.value.length);
  const unreadCount = computed(() => result.value?.pushMessages.unreadCount ?? 0);
  const items = computed<VcPushMessageType[]>(
    () =>
      result.value?.pushMessages.items.map(({ id, createdDate, shortMessage, status }) => ({
        id,
        createdDate: createdDate!,
        shortMessage: shortMessage!,
        read: status === "Read",
      })) ?? [],
  );

  const { mutate: markReadAll } = useMarkReadAllPushMessages();
  const { mutate: markUnreadAll } = useMarkUnreadAllPushMessages();
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
