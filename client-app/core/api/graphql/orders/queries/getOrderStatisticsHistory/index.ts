import { useQuery } from "@vue/apollo-composable";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { GetOrderStatisticsHistoryDocument } from "@/core/api/graphql/types";
import type { GetOrderStatisticsHistoryQueryVariables } from "@/core/api/graphql/types";
import type { Ref } from "vue";

/**
 * How many orders the signed-in user has ever placed, for the Sales Statistics empty state; the backend takes the user
 * from the token. Notifications are suppressed and nothing on the page names a failure, on purpose: the answer only
 * chooses between the empty state and the report, and without it the report shows, which is never wrong for a buyer
 * who has orders. The failure is logged.
 */
export function useGetOrderStatisticsHistoryQuery(variables: Ref<GetOrderStatisticsHistoryQueryVariables>) {
  return useQuery(GetOrderStatisticsHistoryDocument, variables, {
    fetchPolicy: "cache-and-network",
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
  });
}
