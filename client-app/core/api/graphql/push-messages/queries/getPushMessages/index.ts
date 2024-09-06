import { useQuery } from "@vue/apollo-composable";
import { toValue } from "vue";
import { GetPushMessagesDocument, OnPushMessageCreatedDocument } from "../../types";
import type { GetPushMessagesQueryVariables } from "../../types";
import type { MaybeRefOrGetter } from "vue";

let subscribed = false;
let subscribedWithHidden = false;

export function useGetPushMessages(payload: MaybeRefOrGetter<GetPushMessagesQueryVariables>) {
  const result = useQuery(GetPushMessagesDocument, payload, { fetchPolicy: "cache-and-network" });
  const payloadValue = toValue(payload);
  if ((!payloadValue.withHidden && subscribed) || (payloadValue.withHidden && subscribedWithHidden)) {
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
          totalCount: !payloadValue.withHidden ? (unreadCount ?? 0) + 1 : unreadCount,
        },
        unreadCountWithHidden: {
          totalCount: !payloadValue.withHidden ? (unreadCountWithHidden ?? 0) + 1 : unreadCountWithHidden,
        },
      };
    },
  });
  if (!payloadValue.withHidden) {
    subscribed = true;
  }
  if (payloadValue.withHidden) {
    subscribedWithHidden = true;
  }
  return result;
}
