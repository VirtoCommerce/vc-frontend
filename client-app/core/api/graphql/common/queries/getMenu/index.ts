import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import { GetMenuDocument } from "./getMenu.generated";
import type { MenuLinkType, Query, QueryMenuArgs } from "@/core/api/graphql/types/base.generated";

export async function getMenu(name: string): Promise<MenuLinkType[]> {
  const { storeId, cultureName } = globals;

  const { data } = await graphqlClient.query<Pick<Query, "menu">, QueryMenuArgs>({
    query: GetMenuDocument,
    variables: {
      storeId,
      cultureName,
      name,
    },
  });

  return data.menu?.items ?? [];
}
