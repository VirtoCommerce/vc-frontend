import { useApolloClient } from "@vue/apollo-composable";
import { merge } from "lodash";
import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { ClearAllPushMessagesDocument, GetPushMessagesDocument } from "@/core/api/graphql/types";

export function useClearAllPushMessages() {
  const { client } = useApolloClient();
  const result = useMutation(ClearAllPushMessagesDocument, {
    optimisticResponse: {
      clearAllPushMessages: true,
    },
    update(cache) {
      cache.updateQuery({ query: GetPushMessagesDocument }, (previousQueryResult) =>
        merge({}, previousQueryResult, {
          pushMessages: {
            unreadCount: 0,
            items: [],
          },
        }),
      );
    },
  });
  result.onDone(() => client.cache.gc());
  return result;
}
