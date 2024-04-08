import { useQuery } from "@vue/apollo-composable";
import { GetPushMessagesDocument, OnPushMessageCreatedDocument } from "@/core/api/graphql/types";
import type { GetPushMessagesQueryVariables } from "@/core/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export function useGetPushMessages(payload: MaybeRefOrGetter<GetPushMessagesQueryVariables>) {
  const result = useQuery(GetPushMessagesDocument, payload, { fetchPolicy: "cache-and-network" });
  result.subscribeToMore({
    document: OnPushMessageCreatedDocument,
    updateQuery: (previousQueryResult, { subscriptionData }) => {
      if (!subscriptionData.data) {
        return previousQueryResult;
      }
      const newPushMessage = subscriptionData.data.pushMessageCreated;
      const items = previousQueryResult.pushMessages?.items ?? [];
      return {
        ...previousQueryResult,
        pushMessages: {
          unreadCount: (previousQueryResult.pushMessages?.unreadCount || 0) + 1,
          items: [newPushMessage, ...items],
        },
      };
    },
  });
  return result;
}
