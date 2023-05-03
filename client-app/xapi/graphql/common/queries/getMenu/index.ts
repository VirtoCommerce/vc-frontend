import globals from "@/core/globals";
import queryDocument from "./getMenu.graphql";
import type { MenuLinkType, Query, QueryMenuArgs } from "@/xapi/types";

export async function getMenu(name: string): Promise<MenuLinkType[]> {
  const { storeId, cultureName } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Pick<Query, "menu">, QueryMenuArgs>({
    query: queryDocument,
    variables: {
      storeId,
      cultureName,
      name,
    },
  });

  return data.menu?.items ?? [];
}
