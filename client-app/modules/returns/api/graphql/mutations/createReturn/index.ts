import { useApolloClient, useMutation } from "@vue/apollo-composable";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { filterActiveQueryNames } from "@/core/api/graphql/utils";
import { CreateReturnDocument, OperationNames } from "@/modules/returns/api/graphql/types";

export function useCreateReturnMutation() {
  const { client } = useApolloClient();

  return useMutation(CreateReturnDocument, {
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
    // Only the queries on screen: naming one that is not makes Apollo warn, and a list reloads when it is shown.
    refetchQueries: () =>
      filterActiveQueryNames(client, [OperationNames.Query.GetReturns, OperationNames.Query.GetReturnableItems]),
  });
}
