import { merge } from "lodash";
import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { MarkPushMessageReadDocument, OperationNames, PushMessageFragmentDoc } from "@/core/api/graphql/types";
import type { GetPushMessagesQuery } from "@/core/api/graphql/types";

export function useMarkPushMessageRead() {
  return useMutation(MarkPushMessageReadDocument, {
    // TODO: Remove all code below in next iteration when XAPI will return objects from mutations
    optimisticResponse: {
      markPushMessageRead: true,
    },
    update(cache, _, { variables }) {
      cache.updateFragment(
        {
          id: `PushMessageType:${variables?.command?.messageId}`,
          fragment: PushMessageFragmentDoc,
        },
        // TODO: Move this code to optimisticResponse in next iteration for better UX responsitibility
        (pushMessage) => merge({}, pushMessage, { status: "Read" }),
      );
    },
    updateQueries: {
      [OperationNames.Query.GetPushMessages]: (previousQueryResult) => {
        const pushMessagesQueryResult = previousQueryResult as GetPushMessagesQuery;
        return merge({}, pushMessagesQueryResult, {
          pushMessages: {
            unreadCount: pushMessagesQueryResult.pushMessages.items.length - 1,
          },
        });
      },
    },
    // Just in case we did something wrong in cache
    refetchQueries: [OperationNames.Query.GetPushMessages],
  });
}
