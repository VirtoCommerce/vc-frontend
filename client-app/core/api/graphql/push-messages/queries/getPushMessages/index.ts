import { useQuery } from "@vue/apollo-composable";
import { GetPushMessagesDocument, OnPushMessageCreatedDocument } from "@/core/api/graphql/types";
import type { GetPushMessagesQueryVariables } from "@/core/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

let subscribed = false;

export function useGetPushMessages(payload: MaybeRefOrGetter<GetPushMessagesQueryVariables>) {
  const result = useQuery(GetPushMessagesDocument, payload, { fetchPolicy: "cache-and-network" });
  if (subscribed) {
    return result;
  }
  result.subscribeToMore({
    document: OnPushMessageCreatedDocument,
    updateQuery: (previousQueryResult, { subscriptionData }) => {
      if (!subscriptionData.data) {
        return previousQueryResult;
      }

      const newPushMessage = subscriptionData.data.pushMessageCreated;
      const items = previousQueryResult.pushMessages?.items ?? [];
      const unreadCount = previousQueryResult.unreadCount?.totalCount;
      const unreadCountWithHidden = previousQueryResult.unreadCountWithHidden?.totalCount;

      return {
        ...previousQueryResult,
        pushMessages: {
          items: [newPushMessage, ...items],
          totalCount: items.length + 1,
        },
        unreadCount: {
          totalCount: unreadCount ? unreadCount + 1 : 1,
        },
        unreadCountWithHidden: {
          totalCount: unreadCountWithHidden ? unreadCountWithHidden + 1 : 1,
        },
      };
    },
  });
  subscribed = true;
  return result;
}
