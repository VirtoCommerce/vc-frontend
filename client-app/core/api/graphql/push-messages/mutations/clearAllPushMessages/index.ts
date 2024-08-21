import { useApolloClient } from "@vue/apollo-composable";
import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { ClearAllPushMessagesDocument, OperationNames } from "@/core/api/graphql/types";

export function useClearAllPushMessages() {
  const { client } = useApolloClient();
  const result = useMutation(ClearAllPushMessagesDocument, {
    optimisticResponse: {
      clearAllPushMessages: true,
    },
    update(cache, updateResult) {
      if (!updateResult.data?.clearAllPushMessages) {
        return;
      }
      const cacheData = cache.extract() as Record<string, unknown>;
      const pushMessages = Object.entries(cacheData["ROOT_QUERY"] ?? {}).find(([key]) =>
        key.startsWith("pushMessages:"),
      );
      pushMessages?.forEach(([id, data]) => {
        cache.modify({
          id: id,
          fields: {
            ...data,
            items: [],
            totalCount: 0,
          },
        });
      });
    },
    // Just in case we did something wrong in cache
    refetchQueries: [OperationNames.Query.GetPushMessages],
  });
  result.onDone(() => client.cache.gc());
  return result;
}
