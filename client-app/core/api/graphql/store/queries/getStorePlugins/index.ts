import { GetStorePluginsDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";

/**
 * Kept out of the boot store query: `store.plugins` needs x-api 3.1016.0, and one unknown field
 * fails the whole document — which would take `settings.modules` down with it.
 */
export async function getStorePlugins(domain: string) {
  const { data } = await graphqlClient.query({
    query: GetStorePluginsDocument,
    variables: {
      domain,
    },
  });

  return data.store?.plugins;
}
