import { merge } from "lodash";
import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { MarkAllPushMessagesReadDocument, OperationNames } from "@/core/api/graphql/types";
import type { GetPushMessagesQuery } from "@/core/api/graphql/types";

export function useMarkAllPushMessagesRead() {
  return useMutation(MarkAllPushMessagesReadDocument, {
    optimisticResponse: {
      markAllPushMessagesRead: true,
    },
    updateQueries: {
      [OperationNames.Query.GetPushMessages]: (previousQueryResult) => {
        const pushMessagesQueryResult = previousQueryResult as GetPushMessagesQuery;
        return merge({}, pushMessagesQueryResult, {
          pushMessages: {
            unreadCount: 0,
            items: pushMessagesQueryResult.pushMessages.items.map((pushMessage) =>
              merge({}, pushMessage, { status: "Read" }),
            ),
          },
        });
      },
    },
    // Just in case we did something wrong in cache
    refetchQueries: [OperationNames.Query.GetPushMessages],
  });
}
