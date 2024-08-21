import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { MarkAllPushMessagesReadDocument, OperationNames } from "@/core/api/graphql/types";
import {
  PUSH_MESSAGE_CACHE_ID,
  UNREAD_COUNT_CACHE_ID,
  UNREAD_COUNT_WITH_HIDDEN_CACHE_ID,
} from "@/core/constants/notifications";
import type { UnreadCountType } from "@/core/types/notifications";

export function useMarkAllPushMessagesRead() {
  return useMutation(MarkAllPushMessagesReadDocument, {
    optimisticResponse: {
      markAllPushMessagesRead: true,
    },
    update(cache, result) {
      if (!result.data?.markAllPushMessagesRead) {
        return;
      }
      const cacheData = cache.extract() as Record<string, unknown>;

      // update all push messages to be read
      Object.keys(cacheData).forEach((id) => {
        if (id.startsWith(PUSH_MESSAGE_CACHE_ID)) {
          cache.modify({
            id: id,
            fields: {
              isRead: () => true,
            },
          });
        }
      });

      // update unreadCount and unreadCountWithHidden count to 0
      cache.modify<Record<string, UnreadCountType>>({
        fields: {
          [UNREAD_COUNT_CACHE_ID]: () => ({
            totalCount: 0,
          }),
          [UNREAD_COUNT_WITH_HIDDEN_CACHE_ID]: () => ({
            totalCount: 0,
          }),
        },
      });
    },
    // Just in case we did something wrong in cache
    refetchQueries: [OperationNames.Query.GetPushMessages],
  });
}
