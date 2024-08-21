import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { MarkAllPushMessagesUnreadDocument, OperationNames } from "@/core/api/graphql/types";

export function useMarkAllPushMessagesUnread() {
  return useMutation(MarkAllPushMessagesUnreadDocument, {
    optimisticResponse: {
      markAllPushMessagesUnread: true,
    },
    update(cache, result) {
      if (!result.data?.markAllPushMessagesUnread) {
        return;
      }
      const cacheData = cache.extract() as Record<string, unknown>;
      Object.keys(cacheData).forEach((id) => {
        if (id.startsWith("PushMessageType:")) {
          cache.modify({
            id: id,
            fields: {
              isRead() {
                return false;
              },
            },
          });
        }
      });
      const itemsWithHiddenLength =
        Object.entries(cacheData["ROOT_QUERY"] ?? {}).find(
          ([key]) => key.startsWith("pushMessages:") && key.includes("after") && key.includes('"withHidden":true'),
        )?.[1]?.totalCount ?? 0;
      cache.modify({
        fields: {
          'pushMessages:{"unreadOnly":true}': (data) => {
            return {
              ...data,
              totalCount: itemsWithHiddenLength,
            };
          },
          'pushMessages:{"withHidden":true,"unreadOnly":true}': (data) => {
            return {
              ...data,
              totalCount: itemsWithHiddenLength,
            };
          },
        },
      });
    },
    // Just in case we did something wrong in cache
    refetchQueries: [OperationNames.Query.GetPushMessages],
  });
}
