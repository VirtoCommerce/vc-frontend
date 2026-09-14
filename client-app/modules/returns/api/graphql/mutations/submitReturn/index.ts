import { useMutation } from "@vue/apollo-composable";
import { OperationNames, SubmitReturnDocument } from "@/modules/returns/api/graphql/types";

export function useSubmitReturnMutation() {
  return useMutation(SubmitReturnDocument, {
    // The status changes, so the list the buyer returns to must not show a stale "Draft".
    refetchQueries: [OperationNames.Query.GetReturns],
  });
}
