import { provideApolloClient } from "@vue/apollo-composable";
import { computed, ref, toValue } from "vue";
import { apolloClient } from "@/core/api/graphql";
import { useAllGlobalVariables } from "@/core/api/graphql/composables";
import { useClearAllPushMessages } from "@/core/api/graphql/push-messages/mutations/clearAllPushMessages";
import { useMarkAllPushMessagesRead } from "@/core/api/graphql/push-messages/mutations/markAllPushMessagesRead";
import { useMarkAllPushMessagesUnread } from "@/core/api/graphql/push-messages/mutations/markAllPushMessagesUnread";
import { useGetPushMessages } from "@/core/api/graphql/push-messages/queries/getPushMessages";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { DEFAULT_ORDERS_PER_PAGE } from "@/core/constants";
import { MODULE_ID_PUSH_MESSAGES } from "@/core/constants/modules";
import { useUser } from "@/shared/account";
import type { GetPushMessagesQueryVariables } from "@/core/api/graphql/push-messages/types";
import type { Ref, MaybeRef } from "vue";

export interface IUsePushMessagesOptions {
  showUnreadOnly?: MaybeRef<boolean>;
  withHidden?: MaybeRef<boolean>;
  itemsPerPage?: MaybeRef<number>;
}

provideApolloClient(apolloClient);

const { isAuthenticated } = useUser();
const { hasModuleSettings } = useModuleSettings(MODULE_ID_PUSH_MESSAGES);
const { themeContext } = useThemeContext();

const isActive = computed(
  () => themeContext.value?.settings?.push_messages_enabled && hasModuleSettings.value && isAuthenticated.value,
);

function usePushMessages(options?: IUsePushMessagesOptions) {
  if (!isActive.value) {
    return {
      totalCount: computed(() => 0),
      unreadCount: computed(() => 0),
      unreadCountWithHidden: computed(() => 0),
      items: computed(() => []),
      markReadAll: async () => {},
      markUnreadAll: async () => {},
      clearAll: async () => {},
      loading: computed(() => false),
      pages: computed(() => 0),
      page: ref(1),
    };
  }
  const itemsPerPage = ref(options?.itemsPerPage ?? DEFAULT_ORDERS_PER_PAGE);
  const page: Ref<number> = ref(1);

  const getPushMessagesParams = computed<GetPushMessagesQueryVariables>(() => {
    return {
      withHidden: toValue(options?.withHidden),
      cultureName: toValue(useAllGlobalVariables()).cultureName,
      unreadOnly: toValue(options?.showUnreadOnly),
      first: itemsPerPage.value,
      after: String((page.value - 1) * itemsPerPage.value),
    };
  });

  const { result, loading } = useGetPushMessages(getPushMessagesParams);

  const totalCount = computed(() => items.value.length);
  const unreadCount = computed(() => result.value?.unreadCount?.totalCount ?? 0);
  const unreadCountWithHidden = computed(() => result.value?.unreadCountWithHidden?.totalCount ?? 0);
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
    unreadCountWithHidden,
    items,
    markReadAll,
    markUnreadAll,
    clearAll,
    loading,
    pages,
    page,
  };
}

export { isActive, usePushMessages };
