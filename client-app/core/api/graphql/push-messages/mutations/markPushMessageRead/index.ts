import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { MarkPushMessageReadDocument, OperationNames } from "@/core/api/graphql/types";

export function useMarkPushMessageRead() {
  return useMutation(MarkPushMessageReadDocument, {
    // Just in case we did something wrong in cache
    refetchQueries: [OperationNames.Query.GetPushMessages],
  });
}
