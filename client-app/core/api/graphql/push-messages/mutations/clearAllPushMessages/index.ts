import { useApolloClient } from "@vue/apollo-composable";
import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { ROOT_QUERY_CACHE_ID } from "@/core/api/graphql/consts";
import { PUSH_MESSAGES_CACHE_ID } from "@/core/constants/notifications";
import { ClearAllPushMessagesDocument, OperationNames } from "../../types";
import type { PushMessageConnection } from "../../types";

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
        key.startsWith(PUSH_MESSAGES_CACHE_ID),
      );
      pushMessagesIds?.forEach((id) => {
        cache.modify<Record<string, PushMessageConnection[keyof PushMessageConnection]>>({
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
