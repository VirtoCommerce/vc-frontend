import { useMutation } from "@/core/api/graphql/composables/useMutation";
import {
  PUSH_MESSAGE_CACHE_ID,
  UNREAD_COUNT_CACHE_ID,
  UNREAD_COUNT_WITH_HIDDEN_CACHE_ID,
} from "@/core/constants/notifications";
import { MarkPushMessageUnreadDocument, OperationNames, PushMessageFragmentDoc } from "../../types";
import type { PushMessageConnection, PushMessageType } from "../../types";

type UnreadCountType = Pick<PushMessageConnection, "totalCount">;

export function useMarkPushMessageUnread() {
  return useMutation(MarkPushMessageUnreadDocument, {
    optimisticResponse: {
      markPushMessageUnread: true,
    },
    update(cache, result, { variables }) {
      if (!result.data?.markPushMessageUnread) {
        return;
      }

      let message: PushMessageType | null = null;

      // update push message to be unread
      cache.updateFragment(
        {
          id: `${PUSH_MESSAGE_CACHE_ID}${variables?.command?.messageId}`,
          fragment: PushMessageFragmentDoc,
        },
        (pushMessage) => {
          message = pushMessage;
          return pushMessage ? { ...pushMessage, isRead: false } : null;
        },
      );

      // update unreadCount and unreadCountWithHidden value
      cache.modify({
        fields: {
          [UNREAD_COUNT_CACHE_ID]: (value) => {
            const unreadCount = value as UnreadCountType;
            if (message?.isHidden) {
              return unreadCount;
            }
            return {
              totalCount: (unreadCount.totalCount ?? 0) + 1,
            };
          },
          [UNREAD_COUNT_WITH_HIDDEN_CACHE_ID]: (value) => {
            const unreadCountWithHidden = value as UnreadCountType;
            return {
              totalCount: (unreadCountWithHidden.totalCount ?? 0) + 1,
            };
          },
        },
      });
    },
    // Just in case we did something wrong in cache
    refetchQueries: [OperationNames.Query.GetPushMessages],
  });
}
