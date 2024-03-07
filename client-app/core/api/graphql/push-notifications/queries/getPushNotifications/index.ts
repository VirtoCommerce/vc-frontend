import { useQuery } from "@vue/apollo-composable";
import { merge } from "lodash";
import { GetPushNotificationsDocument, OnPushNotificationCreatedDocument } from "@/core/api/graphql/types";

export function useGetPushNotifications() {
  const result = useQuery(GetPushNotificationsDocument);
  result.subscribeToMore({
    document: OnPushNotificationCreatedDocument,
    updateQuery: (previousQueryResult, { subscriptionData }) => {
      if (!subscriptionData.data) {
        return previousQueryResult;
      }
      const newPushNotification = subscriptionData.data.pushNotificationCreated;
      return merge({}, previousQueryResult, {
        pushNotifications: {
          unreadCount: previousQueryResult.pushNotifications.unreadCount + 1,
          items: [newPushNotification, ...previousQueryResult.pushNotifications.items],
        },
      });
    },
  });
  return result;
}
