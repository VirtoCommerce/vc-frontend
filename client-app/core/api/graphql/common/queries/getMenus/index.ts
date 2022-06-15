import client from "@core/api/graphql/graphql-client";
import { MenuLinkListType, Query, QueryMenusArgs } from "@core/api/graphql/types";
import getMenusQueryDocument from "./getMenus.graphql";
import globals from "@core/globals";

export default async function getMenus(payload?: Partial<QueryMenusArgs>): Promise<MenuLinkListType[]> {
  const { storeId } = globals;

  const { data } = await client.query<Required<Pick<Query, "menus">>, QueryMenusArgs>({
    query: getMenusQueryDocument,
    variables: {
      storeId,
      ...payload,
    },
  });

  return data.menus;
}
