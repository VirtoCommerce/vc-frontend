import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { GetLayoutDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";
import type { GetLayoutQueryVariables } from "@/core/api/graphql/types";

/**
 * The signed-in user's saved layout of one dashboard; null when they never saved it.
 *
 * Notifications are suppressed because the dashboard names the failure itself (it shows its default arrangement
 * under an alert). `no-cache`: a page reads its layout once, and a save returns the stored document, so a cached
 * copy could only ever be an older one.
 */
export async function getLayout(variables: GetLayoutQueryVariables) {
  const { data } = await graphqlClient.query({
    query: GetLayoutDocument,
    variables,
    fetchPolicy: "no-cache",
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
  });

  return data.layout;
}
