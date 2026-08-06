import { provideApolloClient } from "@vue/apollo-composable";
import { effectScope } from "vue";
import { apolloClient } from "@/core/api/graphql/client";
import { useSalesRepCustomersCount } from "./useSalesRepCustomersCount";
import type { ComputedRef } from "vue";

// The count is read by the host's own menu markup, not by a component of this module, so it
// cannot rely on an ambient client injected by a component scope.
provideApolloClient(apolloClient);

let count: ComputedRef<number> | undefined;

/**
 * App-lifetime customers count for the mobile nav badge, created on first read.
 *
 * Lazy: registering the nav entry must not query for buyers who never see the badge.
 * Detached scope: the count outlives whichever component happened to read it first.
 */
export function salesRepCustomersCount(): number {
  count ??= effectScope(true).run(() => useSalesRepCustomersCount().count);
  return count?.value ?? 0;
}
