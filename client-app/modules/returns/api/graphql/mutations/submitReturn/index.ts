import { useApolloClient, useMutation } from "@vue/apollo-composable";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { filterActiveQueryNames } from "@/core/api/graphql/utils";
import { OperationNames, SubmitReturnDocument } from "@/modules/returns/api/graphql/types";

export function useSubmitReturnMutation() {
  const { client } = useApolloClient();

  return useMutation(SubmitReturnDocument, {
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
    // Mounted queries only: Apollo warns about the others, and a list refetches when it is shown.
    refetchQueries: () =>
      filterActiveQueryNames(client, [
        OperationNames.Query.GetReturns,
        OperationNames.Query.GetOrganizationReturns,
        OperationNames.Query.GetReturn,
        OperationNames.Query.GetReturnableItems,
      ]),
  });
}
