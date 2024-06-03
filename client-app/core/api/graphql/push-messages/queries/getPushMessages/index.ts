import { useQuery } from "@vue/apollo-composable";
import { GetPushMessagesDocument, OnPushMessageCreatedDocument } from "@/core/api/graphql/types";
import type { GetPushMessagesQueryVariables } from "@/core/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export function useGetPushMessages(payload: MaybeRefOrGetter<GetPushMessagesQueryVariables>) {
  const result = useQuery(GetPushMessagesDocument, payload, { fetchPolicy: "cache-and-network" });
  result.subscribeToMore({
    document: OnPushMessageCreatedDocument,
    // TODO: Refactor updateQueries to use update since it will be deprecated in the next version of Apollo Client - https://www.apollographql.com/docs/react/api/react/hoc/#optionsupdatequeries
    updateQuery: (previousQueryResult, { subscriptionData }) => {
      if (!subscriptionData.data) {
        return previousQueryResult;
      }
      const newPushMessage = subscriptionData.data.pushMessageCreated;
      const items = previousQueryResult.pushMessages?.items ?? [];
      return {
        ...previousQueryResult,
        pushMessages: {
          items: [newPushMessage, ...items],
          totalCount: items.length + 1,
        },
        unreadCount: {
          totalCount: previousQueryResult.unreadCount?.totalCount ? previousQueryResult.unreadCount.totalCount + 1 : 1,
        },
      };
    },
  });
  return result;
}
