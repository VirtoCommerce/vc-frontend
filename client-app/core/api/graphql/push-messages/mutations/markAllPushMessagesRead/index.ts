import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { MarkAllPushMessagesReadDocument, OperationNames } from "@/core/api/graphql/types";

export function useMarkAllPushMessagesRead() {
  return useMutation(MarkAllPushMessagesReadDocument, {
    // TODO: Implement optimistic response and cache update
    refetchQueries: [OperationNames.Query.GetPushMessages],
  });
}
