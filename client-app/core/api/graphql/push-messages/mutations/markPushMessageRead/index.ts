import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { MarkPushMessageReadDocument, OperationNames, PushMessageFragmentDoc } from "@/core/api/graphql/types";
import type { GetPushMessagesQuery } from "@/core/api/graphql/types";

export function useMarkPushMessageRead() {
  return useMutation(MarkPushMessageReadDocument, {
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
          (pushMessage) => ({ ...pushMessage!, isRead: true }),
        );
      }
    },
    // TODO: Refactor updateQueries to use update since it will be deprecated in the next version of Apollo Client - https://www.apollographql.com/docs/react/api/react/hoc/#optionsupdatequeries
    updateQueries: {
      [OperationNames.Query.GetPushMessages]: (previousQueryResult) => {
        const pushMessagesQueryResult = previousQueryResult as GetPushMessagesQuery;
        return {
          ...pushMessagesQueryResult,
          unreadCount: {
            totalCount: pushMessagesQueryResult.unreadCount?.totalCount
              ? pushMessagesQueryResult.unreadCount.totalCount - 1
              : 0,
          },
        } satisfies GetPushMessagesQuery;
      },
    },
    // Just in case we did something wrong in cache
    refetchQueries: [OperationNames.Query.GetPushMessages],
  });
}
