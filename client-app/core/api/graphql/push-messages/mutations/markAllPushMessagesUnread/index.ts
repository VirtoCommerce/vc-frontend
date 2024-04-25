import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { MarkAllPushMessagesUnreadDocument, OperationNames } from "@/core/api/graphql/types";
import type { GetPushMessagesQuery } from "@/core/api/graphql/types";

export function useMarkAllPushMessagesUnread() {
  return useMutation(MarkAllPushMessagesUnreadDocument, {
    // TODO: Remove all code below in next iteration when XAPI will return objects from mutations
    // https://virtocommerce.atlassian.net/browse/VCST-833
    optimisticResponse: {
      markAllPushMessagesUnread: true,
    },
    updateQueries: {
      [OperationNames.Query.GetPushMessages]: (previousQueryResult, { mutationResult }) => {
        const pushMessagesQueryResult = previousQueryResult as GetPushMessagesQuery;
        if (mutationResult.data?.markAllPushMessagesUnread) {
          return {
            ...pushMessagesQueryResult,
            // TODO: Move this code to optimisticResponse in next iteration for better UX responsitibility
            pushMessages: {
              items: pushMessagesQueryResult.pushMessages?.items?.map((pushMessage) => ({
                ...pushMessage,
                isRead: false,
              })),
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
