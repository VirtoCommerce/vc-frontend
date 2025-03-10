import { useMutation } from "@vue/apollo-composable";
import {
  PUSH_MESSAGE_CACHE_ID,
  UNREAD_COUNT_CACHE_ID,
  UNREAD_COUNT_WITH_HIDDEN_CACHE_ID,
} from "@/core/constants/notifications";
import { MarkPushMessageReadDocument, OperationNames, PushMessageFragmentDoc } from "../../types";
import type { PushMessageConnection, PushMessageType } from "../../types";

type UnreadCountType = Pick<PushMessageConnection, "totalCount">;

export function useMarkPushMessageRead() {
  return useMutation(MarkPushMessageReadDocument, {
    optimisticResponse: {
      markPushMessageRead: true,
    },
    update(cache, result, { variables }) {
      if (!result.data?.markPushMessageRead) {
        return;
      }

      let message: PushMessageType | null = null;

      cache.updateFragment(
        {
          id: `${PUSH_MESSAGE_CACHE_ID}${variables?.command?.messageId}`,
          fragment: PushMessageFragmentDoc,
        },
        (pushMessage) => {
          message = pushMessage;
          return pushMessage ? { ...pushMessage, isRead: true } : null;
        },
      );

      cache.modify({
        fields: {
          [UNREAD_COUNT_CACHE_ID]: (value) => {
            const unreadCount = value as UnreadCountType;
            if (message?.isHidden) {
              return unreadCount;
            }
            return {
              totalCount: unreadCount.totalCount ? unreadCount.totalCount - 1 : 0,
            };
          },
          [UNREAD_COUNT_WITH_HIDDEN_CACHE_ID]: (value) => {
            const unreadCountWithHidden = value as UnreadCountType;
            return {
              totalCount: unreadCountWithHidden.totalCount ? unreadCountWithHidden.totalCount - 1 : 0,
            };
          },
        },
      });
    },
    // Just in case we did something wrong in cache
    refetchQueries: [OperationNames.Query.GetPushMessages],
  });
}
