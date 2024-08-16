import { useApolloClient } from "@vue/apollo-composable";
import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { ClearAllPushMessagesDocument, OperationNames } from "../../types";
import type { GetPushMessagesQuery } from "../../types";

export function useClearAllPushMessages() {
  const { client } = useApolloClient();
  const result = useMutation(ClearAllPushMessagesDocument, {
    optimisticResponse: {
      clearAllPushMessages: true,
    },
    // TODO: Refactor updateQueries to use update since it will be deprecated in the next version of Apollo Client - https://www.apollographql.com/docs/react/api/react/hoc/#optionsupdatequeries
    updateQueries: {
      [OperationNames.Query.GetPushMessages]: (previousQueryResult, { mutationResult }) => {
        const pushMessagesQueryResult = previousQueryResult as GetPushMessagesQuery;
        if (mutationResult.data?.clearAllPushMessages) {
          return {
            ...pushMessagesQueryResult,
            pushMessages: {
              items: [],
              totalCount: 0,
            },
            unreadCount: {
              totalCount: 0,
            },
          } satisfies GetPushMessagesQuery;
        } else {
          return { ...pushMessagesQueryResult };
        }
      },
    },
    // Just in case we did something wrong in cache
    refetchQueries: [OperationNames.Query.GetPushMessages],
  });
  result.onDone(() => client.cache.gc());
  return result;
}
