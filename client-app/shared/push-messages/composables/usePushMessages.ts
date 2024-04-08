import { computed, ref, toValue } from "vue";
import { useAllGlobalVariables } from "@/core/api/graphql/composables";
import { useClearAllPushMessages } from "@/core/api/graphql/push-messages/mutations/clearAllPushMessages";
import { useMarkAllPushMessagesRead } from "@/core/api/graphql/push-messages/mutations/markAllPushMessagesRead";
import { useMarkAllPushMessagesUnread } from "@/core/api/graphql/push-messages/mutations/markAllPushMessagesUnread";
import { useGetPushMessages } from "@/core/api/graphql/push-messages/queries/getPushMessages";
import type { Ref } from "vue";

export function usePushMessages(showUnreadOnly: Ref<boolean>) {
  const getPushMessagesParams = computed(() => {
    return {
      unreadOnly: toValue(showUnreadOnly),
      cultureName: toValue(useAllGlobalVariables()).cultureName,
    };
  });

  const { result, loading } = useGetPushMessages(getPushMessagesParams);

  const totalCount = computed(() => items.value.length);
  const unreadCount = computed(() => result.value?.pushMessages?.unreadCount ?? 0);
  const items = computed<VcPushMessageType[]>(() => result.value?.pushMessages?.items?.filter(checkVisibility) ?? []);
  const pages: Ref<number> = ref(0);
  const page: Ref<number> = ref(1);

  const { mutate: markReadAll } = useMarkAllPushMessagesRead();
  const { mutate: markUnreadAll } = useMarkAllPushMessagesUnread();
  const { mutate: clearAll } = useClearAllPushMessages();

  function checkVisibility(item: VcPushMessageType): boolean {
    if (!showUnreadOnly.value) {
      return true;
    }

    return !item.isRead;
  }

  return {
    totalCount,
    unreadCount,
    items,
    markReadAll,
    markUnreadAll,
    clearAll,
    loading,
    showUnreadOnly,
    pages,
    page,
  };
}
