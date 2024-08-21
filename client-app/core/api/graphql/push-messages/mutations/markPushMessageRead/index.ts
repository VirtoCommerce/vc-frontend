import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { MarkPushMessageReadDocument, OperationNames, PushMessageFragmentDoc } from "@/core/api/graphql/types";

export function useMarkPushMessageRead() {
  return useMutation(MarkPushMessageReadDocument, {
    optimisticResponse: {
      markPushMessageRead: true,
    },
    update(cache, result, { variables }) {
      if (!result.data?.markPushMessageRead) {
        return;
      }
      cache.updateFragment(
        {
          id: `PushMessageType:${variables?.command?.messageId}`,
          fragment: PushMessageFragmentDoc,
        },
        (pushMessage) => ({ ...pushMessage!, isRead: true }),
      );
      cache.modify({
        fields: {
          'pushMessages:{"unreadOnly":true}': (value) => {
            return {
              totalCount: value.totalCount ? value.totalCount - 1 : 0,
            };
          },
          'pushMessages:{"withHidden":true,"unreadOnly":true}': (value) => {
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
