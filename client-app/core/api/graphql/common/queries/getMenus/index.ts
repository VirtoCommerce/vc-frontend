import client from "@core/api/graphql/graphql-client";
import { MenuLinkListType, Query, QueryMenusArgs } from "@core/api/graphql/types";
import { locale, storeId } from "@core/constants";
import getMenusQueryDocument from "./getMenus.graphql";

export default async function getMenus(payload?: Omit<QueryMenusArgs, "storeId">): Promise<MenuLinkListType[]> {
  const { data } = await client.query<Required<Pick<Query, "menus">>, QueryMenusArgs>({
    query: getMenusQueryDocument,
    variables: {
      storeId,
      cultureName: locale,
      ...payload,
    },
  });

  return data.menus;
}
