import { useApolloClient } from "@vue/apollo-composable";
import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { ClearAllPushMessagesDocument, OperationNames } from "@/core/api/graphql/types";
import { ROOT_QUERY_CACHE_ID } from "@/core/constants/notifications";

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
      const pushMessagesIds = Object.keys(cacheData[ROOT_QUERY_CACHE_ID] ?? {}).filter(([key]) =>
        key.startsWith("pushMessages:"),
      );
      pushMessagesIds?.forEach((id) => {
        cache.modify<Record<string, unknown>>({
          id: id,
          fields: {
            items: () => [],
            totalCount: () => 0,
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
