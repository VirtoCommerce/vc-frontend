import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { MarkAllPushMessagesUnreadDocument, OperationNames } from "@/core/api/graphql/types";
import type { GetPushMessagesQuery } from "@/core/api/graphql/types";

export function useMarkAllPushMessagesUnread() {
  return useMutation(MarkAllPushMessagesUnreadDocument, {
    optimisticResponse: {
      markAllPushMessagesUnread: true,
    },
    // TODO: Refactor updateQueries to use update
    updateQueries: {
      [OperationNames.Query.GetPushMessages]: (previousQueryResult, { mutationResult }) => {
        const pushMessagesQueryResult = previousQueryResult as GetPushMessagesQuery;
        if (mutationResult.data?.markAllPushMessagesUnread) {
          return {
            ...pushMessagesQueryResult,
            pushMessages: {
              items: pushMessagesQueryResult.pushMessages?.items?.map((pushMessage) => ({
                ...pushMessage,
                isRead: false,
              })),
              totalCount: pushMessagesQueryResult.pushMessages?.items?.length ?? 0,
            },
            unreadCount: {
              totalCount: pushMessagesQueryResult.pushMessages?.items?.length ?? 0,
            },
          } satisfies GetPushMessagesQuery;
        } else {
          return { ...pushMessagesQueryResult };
        }
      },
    },
    // Just in case we did something wrong in cache
    refetchQueries: [OperationNames.Query.GetPushMessages],
  });
}
