import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { MarkPushMessageUnreadDocument, OperationNames, PushMessageFragmentDoc } from "@/core/api/graphql/types";

export function useMarkPushMessageUnread() {
  return useMutation(MarkPushMessageUnreadDocument, {
    optimisticResponse: {
      markPushMessageUnread: true,
    },
    update(cache, result, { variables }) {
      if (!result.data?.markPushMessageUnread) {
        return;
      }
      cache.updateFragment(
        {
          id: `PushMessageType:${variables?.command?.messageId}`,
          fragment: PushMessageFragmentDoc,
        },
        (pushMessage) => ({ ...pushMessage!, isRead: false }),
      );
      cache.modify({
        fields: {
          'pushMessages:{"unreadOnly":true}': (value) => {
            return {
              totalCount: (value.totalCount ?? 0) + 1,
            };
          },
          'pushMessages:{"withHidden":true,"unreadOnly":true}': (value) => {
            return {
              totalCount: (value.totalCount ?? 0) + 1,
            };
          },
        },
      });
    },
    // Just in case we did something wrong in cache
    refetchQueries: [OperationNames.Query.GetPushMessages],
  });
}
