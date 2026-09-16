import { useMutation } from "@vue/apollo-composable";
import { OperationNames, SubmitReturnDocument } from "@/modules/returns/api/graphql/types";

export function useSubmitReturnMutation() {
  return useMutation(SubmitReturnDocument, {
    refetchQueries: [OperationNames.Query.GetReturns, OperationNames.Query.GetReturn],
  });
}
