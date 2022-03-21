import client from "@core/api/graphql/graphql-client";
import { MenuLinkListType } from "@core/api/graphql/types";
import { locale, storeId } from "@core/constants";
import getMenusQueryDocument from "./getMenus.graphql";

export default async function getMenus(): Promise<MenuLinkListType[]> {
  const { data } = await client.query({
    query: getMenusQueryDocument,
    variables: {
      storeId: storeId,
      cultureName: locale,
    },
  });

  return data?.menus;
}
