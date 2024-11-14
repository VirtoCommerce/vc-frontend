import { provideApolloClient } from "@vue/apollo-composable";
import { computed, ref, toValue } from "vue";
import { apolloClient } from "@/core/api/graphql";
import { useAllGlobalVariables } from "@/core/api/graphql/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { DEFAULT_ORDERS_PER_PAGE } from "@/core/constants";
import { MODULE_ID_PUSH_MESSAGES } from "@/core/constants/modules";
import { useUser } from "@/shared/account/composables";
import { useClearAllPushMessages } from "../api/graphql/mutations/clearAllPushMessages";
import { useMarkAllPushMessagesRead } from "../api/graphql/mutations/markAllPushMessagesRead";
import { useMarkAllPushMessagesUnread } from "../api/graphql/mutations/markAllPushMessagesUnread";
import { useGetPushMessages } from "../api/graphql/queries/getPushMessages";
import { PUSH_MESSAGES_MODULE_ENABLED_KEY } from "../constants";
import type { GetPushMessagesQueryVariables } from "../api/graphql/types";
import type { PushMessageType } from "@/modules/push-messages/types";
import type { Ref, MaybeRef } from "vue";

export interface IUsePushMessagesOptions {
  showUnreadOnly?: MaybeRef<boolean>;
  withHidden?: MaybeRef<boolean>;
  itemsPerPage?: MaybeRef<number>;
}

provideApolloClient(apolloClient);

const { isAuthenticated } = useUser();
const { isEnabled } = useModuleSettings(MODULE_ID_PUSH_MESSAGES);
const { themeContext } = useThemeContext();

const isModuleEnabled = computed(() => isEnabled(PUSH_MESSAGES_MODULE_ENABLED_KEY));

const isActive = computed(
  () => themeContext.value?.settings?.push_messages_enabled && isModuleEnabled.value && isAuthenticated.value,
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
  const items = computed<PushMessageType[]>(() => result.value?.pushMessages?.items ?? []);
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
