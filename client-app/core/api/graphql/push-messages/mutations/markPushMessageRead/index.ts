import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { MarkPushMessageReadDocument, OperationNames, PushMessageFragmentDoc } from "@/core/api/graphql/types";
import { UNREAD_COUNT_CACHE_ID, UNREAD_COUNT_WITH_HIDDEN_CACHE_ID } from "@/core/constants/notifications";
import type { PushMessageType } from "@/core/api/graphql/types";

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
          id: `PushMessageType:${variables?.command?.messageId}`,
          fragment: PushMessageFragmentDoc,
        },
        (pushMessage) => {
          message = pushMessage;
          return { ...pushMessage!, isRead: true };
        },
      );
      cache.modify({
        fields: {
          [UNREAD_COUNT_CACHE_ID]: (value) => {
            if (message?.isHidden) {
              return value;
            }
            return {
              totalCount: value.totalCount ? value.totalCount - 1 : 0,
            };
          },
          [UNREAD_COUNT_WITH_HIDDEN_CACHE_ID]: (value) => {
            return {
              totalCount: value.totalCount ? value.totalCount - 1 : 0,
            };
          },
        },
      });
    },
    // Just in case we did something wrong in cache
    refetchQueries: [OperationNames.Query.GetPushMessages],
  });
}
