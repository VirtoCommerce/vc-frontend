import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { MarkAllPushMessagesReadDocument } from "@/core/api/graphql/types";
import type { PushMessageFragment } from "@/core/api/graphql/types";

export function useMarkAllPushMessagesRead() {
  return useMutation(MarkAllPushMessagesReadDocument, {
    optimisticResponse: {
      markAllPushMessagesRead: true,
    },
    update(cache) {
      cache.modify({
        fields: {
          pushNotifications(existingPushMessages) {
            return {
              unreadCount: 0,
              items: existingPushMessages.items.map((item: PushMessageFragment) => {
                return {
                  ...item,
                  status: "Read",
                };
              }),
            };
          },
        },
      });
    },
  });
}
