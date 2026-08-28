import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { GetStorePluginsDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";

/**
 * Kept out of the boot store query: `store.plugins` needs x-api 3.1016.0, and one unknown field
 * fails the whole document — which would take `settings.modules` down with it.
 *
 * Notifications are suppressed because nothing on screen belongs to this query: on a backend that
 * does not know the field, the global handler would otherwise broadcast a generic error toast to
 * every open tab for a feature the visitor cannot see. The caller logs the failure instead.
 */
export async function getStorePlugins(domain: string) {
  const { data } = await graphqlClient.query({
    query: GetStorePluginsDocument,
    variables: {
      domain,
    },
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
  });

  return data.store?.plugins;
}
