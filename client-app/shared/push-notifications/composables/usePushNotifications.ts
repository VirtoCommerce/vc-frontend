import { computed } from "vue";
import { useGetPushNotifications } from "@/core/api/graphql/push-notifications/queries/getPushNotifications";

export function usePushNotifications() {
  const { result } = useGetPushNotifications();

  const totalCount = computed(() => items.value.length);
  const unreadCount = computed(() => result.value?.pushNotifications.unreadCount ?? 0);
  const items = computed<VcPushNotificationType[]>(
    () =>
      result.value?.pushNotifications.items.map(({ id, createdDate, shortMessage, status }) => ({
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
