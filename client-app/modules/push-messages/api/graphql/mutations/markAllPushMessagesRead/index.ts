import { useMutation } from "@vue/apollo-composable";
import {
  PUSH_MESSAGE_CACHE_ID,
  UNREAD_COUNT_CACHE_ID,
  UNREAD_COUNT_WITH_HIDDEN_CACHE_ID,
} from "@/core/constants/notifications";
import { MarkAllPushMessagesReadDocument, OperationNames } from "../../types";
import type { PushMessageConnection } from "../../types";

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

      cache.modify<Record<string, Pick<PushMessageConnection, "totalCount">>>({
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
