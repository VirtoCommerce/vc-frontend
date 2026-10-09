import { SaveLayoutDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";
import type { InputLayout } from "@/core/api/graphql/types";

/**
 * Replaces the signed-in user's layout of one dashboard as a whole and resolves to the document as stored.
 *
 * `no-cache` like the read. No suppressed notifications: a failed save is a user action, so it keeps the global
 * error toast.
 */
export async function saveLayout(command: InputLayout) {
  const { data } = await graphqlClient.mutate({
    mutation: SaveLayoutDocument,
    variables: { command },
    fetchPolicy: "no-cache",
  });

  return data?.saveLayout;
}
