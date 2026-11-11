import { useQuery } from "@vue/apollo-composable";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { GetOrderStatisticsDocument } from "@/core/api/graphql/types";
import type { GetOrderStatisticsQueryVariables } from "@/core/api/graphql/types";
import type { Ref } from "vue";

/**
 * The signed-in user's own order statistics; the backend takes the user from the token.
 *
 * - Notifications are suppressed: every card names its own failure.
 * - `cache-and-network`: the variables are stable within a day, so a revisit renders from the cache at once and
 *   the network refreshes it.
 * - `keepPreviousResult`: entering layout-edit mode widens the `@include` flags, which restarts the query; without
 *   it every card would blank for a round trip with its figures already in hand.
 */
export function useGetOrderStatisticsQuery(variables: Ref<GetOrderStatisticsQueryVariables>, enabled: Ref<boolean>) {
  return useQuery(GetOrderStatisticsDocument, variables, {
    enabled,
    fetchPolicy: "cache-and-network",
    keepPreviousResult: true,
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
  });
}
