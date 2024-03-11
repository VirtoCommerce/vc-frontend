import { useQuery } from "@vue/apollo-composable";
import { merge } from "lodash";
import { GetPushMessagesDocument, OnPushMessageCreatedDocument } from "@/core/api/graphql/types";

export function useGetPushMessages() {
  const result = useQuery(GetPushMessagesDocument, null, { fetchPolicy: "cache-and-network" });
  result.subscribeToMore({
    document: OnPushMessageCreatedDocument,
    updateQuery: (previousQueryResult, { subscriptionData }) => {
      if (!subscriptionData.data) {
        return previousQueryResult;
      }
      const newPushMessage = subscriptionData.data.pushMessageCreated;
      return merge({}, previousQueryResult, {
        pushMessages: {
          unreadCount: previousQueryResult.pushMessages.unreadCount + 1,
          items: [newPushMessage, ...previousQueryResult.pushMessages.items],
        },
      });
    },
  });
  return result;
}
