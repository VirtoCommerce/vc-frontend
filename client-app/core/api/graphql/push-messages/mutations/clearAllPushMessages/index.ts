import { useApolloClient } from "@vue/apollo-composable";
import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { ClearAllPushMessagesDocument, OperationNames } from "@/core/api/graphql/types";
import type { GetPushMessagesQuery } from "@/core/api/graphql/types";

export function useClearAllPushMessages() {
  const { client } = useApolloClient();
  const result = useMutation(ClearAllPushMessagesDocument, {
    // TODO: Remove all code below in next iteration when XAPI will return objects from mutations
    // https://virtocommerce.atlassian.net/browse/VCST-833
    optimisticResponse: {
      clearAllPushMessages: true,
    },
    updateQueries: {
      [OperationNames.Query.GetPushMessages]: (previousQueryResult, { mutationResult }) => {
        if (mutationResult.data?.clearAllPushMessages) {
          return {
            // TODO: Move this code to optimisticResponse in next iteration for better UX responsitibility
            pushMessages: {
              unreadCount: 0,
              items: [],
            },
          } satisfies GetPushMessagesQuery;
        } else {
          return { ...previousQueryResult };
        }
      },
    },
    // Just in case we did something wrong in cache
    refetchQueries: [OperationNames.Query.GetPushMessages],
  });
  result.onDone(() => client.cache.gc());
  return result;
}
