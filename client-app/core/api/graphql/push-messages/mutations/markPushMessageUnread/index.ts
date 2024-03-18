import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { MarkPushMessageUnreadDocument, OperationNames } from "@/core/api/graphql/types";

export function useMarkPushMessageUnread() {
  return useMutation(MarkPushMessageUnreadDocument, {
    // Just in case we did something wrong in cache
    refetchQueries: [OperationNames.Query.GetPushMessages],
  });
}
