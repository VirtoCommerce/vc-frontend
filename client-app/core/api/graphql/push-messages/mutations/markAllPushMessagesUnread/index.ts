import { merge } from "lodash";
import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { MarkAllPushMessagesUnreadDocument, OperationNames } from "@/core/api/graphql/types";
import type { GetPushMessagesQuery } from "@/core/api/graphql/types";

export function useMarkAllPushMessagesUnread() {
  return useMutation(MarkAllPushMessagesUnreadDocument, {
    optimisticResponse: {
      markAllPushMessagesUnread: true,
    },
    updateQueries: {
      [OperationNames.Query.GetPushMessages]: (previousQueryResult) => {
        const pushMessagesQueryResult = previousQueryResult as GetPushMessagesQuery;
        return merge({}, pushMessagesQueryResult, {
          pushMessages: {
            unreadCount: pushMessagesQueryResult.pushMessages.items.length,
            items: pushMessagesQueryResult.pushMessages.items.map((pushMessage) =>
              merge({}, pushMessage, { status: "Unread" }),
            ),
          },
        });
      },
    },
    // Just in case we did something wrong in cache
    refetchQueries: [OperationNames.Query.GetPushMessages],
  });
}
