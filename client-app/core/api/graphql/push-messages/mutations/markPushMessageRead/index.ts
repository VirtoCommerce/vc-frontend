import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { MarkPushMessageReadDocument, OperationNames, PushMessageFragmentDoc } from "@/core/api/graphql/types";
import type { GetPushMessagesQuery } from "@/core/api/graphql/types";

export function useMarkPushMessageRead() {
  return useMutation(MarkPushMessageReadDocument, {
    // TODO: Remove all code below in next iteration when XAPI will return objects from mutations
    // https://virtocommerce.atlassian.net/browse/VCST-833
    optimisticResponse: {
      markPushMessageRead: true,
    },
    update(cache, result, { variables }) {
      if (result.data?.markPushMessageRead) {
        cache.updateFragment(
          {
            id: `PushMessageType:${variables?.command?.messageId}`,
            fragment: PushMessageFragmentDoc,
          },
          // TODO: Move this code to optimisticResponse in next iteration for better UX responsitibility
          (pushMessage) => ({ ...pushMessage!, isRead: true }),
        );
      }
    },
    updateQueries: {
      [OperationNames.Query.GetPushMessages]: (previousQueryResult) => {
        const pushMessagesQueryResult = previousQueryResult as GetPushMessagesQuery;
        return {
          ...pushMessagesQueryResult,
          pushMessages: {
            ...pushMessagesQueryResult.pushMessages,
            unreadCount: (pushMessagesQueryResult.pushMessages?.unreadCount as number) - 1,
          },
        } satisfies GetPushMessagesQuery;
      },
    },
    // Just in case we did something wrong in cache
    refetchQueries: [OperationNames.Query.GetPushMessages],
  });
}
