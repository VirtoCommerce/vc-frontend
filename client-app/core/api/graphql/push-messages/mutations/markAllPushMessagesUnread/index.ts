import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { MarkAllPushMessagesUnreadDocument, OperationNames } from "@/core/api/graphql/types";
import {
  PUSH_MESSAGE_CACHE_ID,
  PUSH_MESSAGES_CACHE_ID,
  ROOT_QUERY_CACHE_ID,
  UNREAD_COUNT_CACHE_ID,
  UNREAD_COUNT_WITH_HIDDEN_CACHE_ID,
} from "@/core/constants/notifications";
import type { UnreadCountType } from "@/core/types/notifications";

export function useMarkAllPushMessagesUnread() {
  return useMutation(MarkAllPushMessagesUnreadDocument, {
    optimisticResponse: {
      markAllPushMessagesUnread: true,
    },
    update(cache, result) {
      if (!result.data?.markAllPushMessagesUnread) {
        return;
      }
      const cacheData = cache.extract() as Record<string, unknown>;
      Object.keys(cacheData).forEach((id) => {
        if (id.startsWith(PUSH_MESSAGE_CACHE_ID)) {
          cache.modify({
            id: id,
            fields: {
              isRead() {
                return false;
              },
            },
          });
        }
      });
      const rootQueryEntries = Object.entries(cacheData[ROOT_QUERY_CACHE_ID] ?? {}) as [
        string,
        Record<string, unknown>,
      ][];
      const itemsCount =
        rootQueryEntries.find(
          ([key]) =>
            key.startsWith(PUSH_MESSAGES_CACHE_ID) && key.includes("after") && !key.includes('"withHidden":true'),
        )?.[1]?.totalCount ?? 0;
      const itemsWithHiddenCount =
        rootQueryEntries.find(
          ([key]) =>
            key.startsWith(PUSH_MESSAGES_CACHE_ID) && key.includes("after") && key.includes('"withHidden":true'),
        )?.[1]?.totalCount ?? 0;
      cache.modify<Record<string, UnreadCountType>>({
        fields: {
          [UNREAD_COUNT_CACHE_ID]: (data) => {
            return {
              ...data,
              totalCount: itemsCount as number,
            };
          },
          [UNREAD_COUNT_WITH_HIDDEN_CACHE_ID]: (data) => {
            return {
              ...data,
              totalCount: itemsWithHiddenCount as number,
            };
          },
        },
      });
    },
    // Just in case we did something wrong in cache
    refetchQueries: [OperationNames.Query.GetPushMessages],
  });
}
