import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { MarkUnreadAllPushMessagesDocument } from "@/core/api/graphql/types";

export function useMarkUnreadAllPushMessages() {
  return useMutation(MarkUnreadAllPushMessagesDocument);
}
