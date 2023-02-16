import globals from "@/core/globals";
import { MenuLinkListType, Query, QueryMenusArgs } from "@/xapi/types";
import getMenusQueryDocument from "./getMenus.graphql";

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
