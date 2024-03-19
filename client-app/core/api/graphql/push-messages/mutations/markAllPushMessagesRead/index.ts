import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { MarkAllPushMessagesReadDocument, OperationNames } from "@/core/api/graphql/types";
import type { GetPushMessagesQuery } from "@/core/api/graphql/types";

export function useMarkAllPushMessagesRead() {
  return useMutation(MarkAllPushMessagesReadDocument, {
    // TODO: Remove all code below in next iteration when XAPI will return objects from mutations
    // https://virtocommerce.atlassian.net/browse/VCST-833
    optimisticResponse: {
      markAllPushMessagesRead: true,
    },
    updateQueries: {
      [OperationNames.Query.GetPushMessages]: (previousQueryResult, { mutationResult }) => {
        if (mutationResult.data?.markAllPushMessagesRead) {
          const pushMessagesQueryResult = previousQueryResult as GetPushMessagesQuery;
          return {
            ...pushMessagesQueryResult,
            // TODO: Move this code to optimisticResponse in next iteration for better UX responsitibility
            pushMessages: {
              unreadCount: 0,
              items: pushMessagesQueryResult.pushMessages.items.map((pushMessage) => ({
                ...pushMessage,
                status: "Read",
              })),
            },
          };
        } else {
          return { ...previousQueryResult };
        }
      },
    },
    // Just in case we did something wrong in cache
    refetchQueries: [OperationNames.Query.GetPushMessages],
  });
}
