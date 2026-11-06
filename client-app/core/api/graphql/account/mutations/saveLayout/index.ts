import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { SaveLayoutDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";
import type { InputLayout } from "@/core/api/graphql/types";

/**
 * Replaces the signed-in user's layout of one dashboard as a whole and resolves to the document as stored.
 *
 * `no-cache` like the read. Notifications are suppressed, as for the read: the dashboard names a failed save itself
 * (the edit bar's alert and announcement, with focus back on Save).
 */
export async function saveLayout(command: InputLayout) {
  const { data } = await graphqlClient.mutate({
    mutation: SaveLayoutDocument,
    variables: { command },
    fetchPolicy: "no-cache",
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
  });

  return data?.saveLayout;
}
