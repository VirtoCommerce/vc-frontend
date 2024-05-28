import { useApolloClient } from "@vue/apollo-composable";
import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { ClearAllPushMessagesDocument, OperationNames } from "@/core/api/graphql/types";

export function useClearAllPushMessages() {
  const { client } = useApolloClient();
  const result = useMutation(ClearAllPushMessagesDocument, {
    // TODO: Implement optimistic response and cache update
    refetchQueries: [OperationNames.Query.GetPushMessages],
  });
  result.onDone(() => client.cache.gc());
  return result;
}
