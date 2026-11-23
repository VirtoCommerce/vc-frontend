import { useQuery } from "@vue/apollo-composable";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { GetMonthlyOrderStatisticsDocument } from "@/core/api/graphql/types";
import type { GetMonthlyOrderStatisticsQueryVariables } from "@/core/api/graphql/types";
import type { Ref } from "vue";

/**
 * The signed-in user's own orders month by month, for the account dashboard's Sales report; the backend takes the
 * user from the token.
 *
 * - Notifications are suppressed: the report names its own failure.
 * - `cache-and-network`: the month windows are stable within a day, so a revisit renders from the cache at once.
 * - `keepPreviousResult`: a new period keeps the figures on screen until its own arrive.
 */
export function useGetMonthlyOrderStatisticsQuery(variables: Ref<GetMonthlyOrderStatisticsQueryVariables>) {
  return useQuery(GetMonthlyOrderStatisticsDocument, variables, {
    fetchPolicy: "cache-and-network",
    keepPreviousResult: true,
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
  });
}
