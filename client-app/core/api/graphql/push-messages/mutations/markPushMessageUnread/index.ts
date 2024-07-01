import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { MarkPushMessageUnreadDocument, OperationNames, PushMessageFragmentDoc } from "@/core/api/graphql/types";
import type { GetPushMessagesQuery } from "@/core/api/graphql/types";

export function useMarkPushMessageUnread(optimistic = true) {
  return useMutation(MarkPushMessageUnreadDocument, {
    optimisticResponse: {
      markPushMessageUnread: true,
    },
    update(cache, result, { variables }) {
      if (result.data?.markPushMessageUnread) {
        cache.updateFragment(
          {
            id: `PushMessageType:${variables?.command?.messageId}`,
            fragment: PushMessageFragmentDoc,
          },
          (pushMessage) => ({ ...pushMessage!, isRead: false }),
        );
      }
    },
    // TODO: Refactor updateQueries to use update since it will be deprecated in the next version of Apollo Client - https://www.apollographql.com/docs/react/api/react/hoc/#optionsupdatequeries
    updateQueries: (!optimistic && {}) || {
      [OperationNames.Query.GetPushMessages]: (previousQueryResult) => {
        const pushMessagesQueryResult = previousQueryResult as GetPushMessagesQuery;
        return {
          ...pushMessagesQueryResult,
          unreadCount: {
            totalCount: pushMessagesQueryResult.unreadCount?.totalCount
              ? pushMessagesQueryResult.unreadCount.totalCount + 1
              : 1,
          },
        } satisfies GetPushMessagesQuery;
      },
    },
    // Just in case we did something wrong in cache
    refetchQueries: [OperationNames.Query.GetPushMessages],
  });
}
