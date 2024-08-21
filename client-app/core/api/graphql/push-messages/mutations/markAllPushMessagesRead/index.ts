import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { MarkAllPushMessagesReadDocument, OperationNames } from "@/core/api/graphql/types";

export function useMarkAllPushMessagesRead() {
  return useMutation(MarkAllPushMessagesReadDocument, {
    optimisticResponse: {
      markAllPushMessagesRead: true,
    },
    update(cache, result) {
      if (!result.data?.markAllPushMessagesRead) {
        return;
      }
      const cacheData = cache.extract() as Record<string, unknown>;
      Object.keys(cacheData).forEach((id) => {
        if (id.startsWith("PushMessageType:")) {
          cache.modify({
            id: id,
            fields: {
              isRead() {
                return true;
              },
            },
          });
        }
      });
      cache.modify({
        fields: {
          'pushMessages:{"unreadOnly":true}': (data) => {
            return {
              ...data,
              totalCount: 0,
            };
          },
          'pushMessages:{"withHidden":true,"unreadOnly":true}': (data) => {
            return {
              ...data,
              totalCount: 0,
            };
          },
        },
      });
    },
    // Just in case we did something wrong in cache
    refetchQueries: [OperationNames.Query.GetPushMessages],
  });
}
