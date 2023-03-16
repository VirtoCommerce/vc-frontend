import globals from "@/core/globals";
import getMenusQueryDocument from "./getMenus.graphql";
import type { MenuLinkListType, Query, QueryMenusArgs } from "@/xapi/types";

export default async function getMenus(payload?: Partial<QueryMenusArgs>): Promise<MenuLinkListType[]> {
  const { storeId } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "menus">>, QueryMenusArgs>({
    query: getMenusQueryDocument,
    variables: {
      storeId,
      ...payload,
    },
  });

  return data.menus;
}
