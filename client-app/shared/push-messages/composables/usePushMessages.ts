import { computed, ref, toValue } from "vue";
import { useAllGlobalVariables } from "@/core/api/graphql/composables";
import { useClearAllPushMessages } from "@/core/api/graphql/push-messages/mutations/clearAllPushMessages";
import { useMarkAllPushMessagesRead } from "@/core/api/graphql/push-messages/mutations/markAllPushMessagesRead";
import { useMarkAllPushMessagesUnread } from "@/core/api/graphql/push-messages/mutations/markAllPushMessagesUnread";
import { useGetPushMessages } from "@/core/api/graphql/push-messages/queries/getPushMessages";
import { DEFAULT_ORDERS_PER_PAGE } from "@/core/constants";
import type { GetPushMessagesQueryVariables } from "@/core/api/graphql/types";
import type { Ref, MaybeRef } from "vue";

export interface IUsePushMessagesOptions {
  showUnreadOnly?: MaybeRef<boolean>;
  withHidden?: MaybeRef<boolean>;
  itemsPerPage?: MaybeRef<number>;
}

export function usePushMessages(options: IUsePushMessagesOptions) {
  const itemsPerPage = ref(options.itemsPerPage ?? DEFAULT_ORDERS_PER_PAGE);
  const page: Ref<number> = ref(1);

  const getPushMessagesParams = computed<GetPushMessagesQueryVariables>(() => {
    return {
      withHidden: toValue(options.withHidden),
      cultureName: toValue(useAllGlobalVariables()).cultureName,
      unreadOnly: !toValue(options.showUnreadOnly),
      first: itemsPerPage.value,
      after: String((page.value - 1) * itemsPerPage.value),
    };
  });

  const { result, loading } = useGetPushMessages(getPushMessagesParams);

  const totalCount = computed(() => items.value.length);
  const unreadCount = computed(() => result.value?.pushMessages?.unreadCount ?? 0);
  const items = computed<VcPushMessageType[]>(() => result.value?.pushMessages?.items ?? []);
  const pages = computed(() => {
    return Math.ceil((result?.value?.pushMessages?.totalCount ?? 0) / itemsPerPage.value);
  });

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
    loading,
    pages,
    page,
  };
}
