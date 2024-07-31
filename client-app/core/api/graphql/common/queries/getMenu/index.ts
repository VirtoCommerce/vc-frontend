import { globals } from "@/core/globals";
import { apolloClient } from "../../../client";
import queryDocument from "./getMenu.graphql";
import type { MenuLinkType, Query, QueryMenuArgs } from "@/core/api/graphql/types";

export async function getMenu(name: string): Promise<MenuLinkType[]> {
  const { storeId, cultureName } = globals;

  const { data } = await apolloClient.query<Pick<Query, "menu">, QueryMenuArgs>({
    query: queryDocument,
    variables: {
      storeId,
      cultureName,
      name,
    },
  });

  return data.menu?.items ?? [];
}
