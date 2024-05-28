import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { MarkAllPushMessagesUnreadDocument, OperationNames } from "@/core/api/graphql/types";

export function useMarkAllPushMessagesUnread() {
  return useMutation(MarkAllPushMessagesUnreadDocument, {
    // TODO: Implement optimistic response and cache update
    refetchQueries: [OperationNames.Query.GetPushMessages],
  });
}
