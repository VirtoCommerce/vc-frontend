import { GetMenuDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";

export async function getMenu(name: string, cultureName = globals.cultureName) {
  const { storeId } = globals;

  const { data } = await graphqlClient.query({
    query: GetMenuDocument,
    variables: {
      storeId,
      cultureName,
      name,
    },
  });

  return data.menu?.items ?? [];
}
