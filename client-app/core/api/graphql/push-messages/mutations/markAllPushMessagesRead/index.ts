import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { MarkAllPushMessagesReadDocument, OperationNames } from "../../types";
import type { GetPushMessagesQuery } from "../../types";

export function useMarkAllPushMessagesRead() {
  return useMutation(MarkAllPushMessagesReadDocument, {
    optimisticResponse: {
      markAllPushMessagesRead: true,
    },
    updateQueries: {
      [OperationNames.Query.GetPushMessages]: (previousQueryResult, { mutationResult }) => {
        const pushMessagesQueryResult = previousQueryResult as GetPushMessagesQuery;
        if (mutationResult.data?.markAllPushMessagesRead) {
          return {
            ...pushMessagesQueryResult,
            pushMessages: {
              items: pushMessagesQueryResult.pushMessages?.items?.map((pushMessage) => ({
                ...pushMessage,
                isRead: true,
              })),
              totalCount: pushMessagesQueryResult.pushMessages?.items?.length ?? 0,
            },
            unreadCount: {
              totalCount: 0,
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
