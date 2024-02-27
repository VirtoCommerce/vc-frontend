import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import { GetMenusDocument } from "./getMenus.generated";
import type { MenuLinkListType, Query, QueryMenusArgs } from "@/core/api/graphql/types";

export async function getMenus(payload?: Partial<QueryMenusArgs>): Promise<MenuLinkListType[]> {
  const { storeId } = globals;

  const { data } = await graphqlClient.query<Required<Pick<Query, "menus">>, QueryMenusArgs>({
    query: GetMenusDocument,
    variables: {
      storeId,
      ...payload,
    },
  });

  return data.menus;
}
