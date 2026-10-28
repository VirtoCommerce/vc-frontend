import { useMutation } from "@vue/apollo-composable";
import { DeleteSignInKeyDocument, OperationNames } from "@/core/api/graphql/types";

export function useDeleteSignInKeyMutation() {
  return useMutation(DeleteSignInKeyDocument, {
    refetchQueries: [OperationNames.Query.GetSignInMethods],
  });
}
