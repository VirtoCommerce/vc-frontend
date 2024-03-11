import { computed } from "vue";
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

  return {
    totalCount,
    unreadCount,
    items,
  };
}
