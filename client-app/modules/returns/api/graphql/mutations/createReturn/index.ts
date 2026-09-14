import { useMutation } from "@vue/apollo-composable";
import { CreateReturnDocument, OperationNames } from "@/modules/returns/api/graphql/types";

export function useCreateReturnMutation() {
  return useMutation(CreateReturnDocument, {
    // The new draft has to show up in the list the buyer lands back on.
    refetchQueries: [OperationNames.Query.GetReturns],
  });
}
