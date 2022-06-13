import client from "@core/api/graphql/graphql-client";
import { DEFAULT_PAGE_SIZE } from "@core/constants";
import queryDocument from "./getWishlists.graphql";
import { Query, QueryWishlistsArgs, WishlistConnection } from "@core/api/graphql/types";
import { WishlistsSearchParams } from "@core/api/graphql/account";
import globals from "@core/globals";

export default async function getWishlists({
  itemsPerPage = DEFAULT_PAGE_SIZE,
  page = 1,
  sort,
}: Partial<WishlistsSearchParams>): Promise<WishlistConnection> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await client.query<Required<Pick<Query, "wishlists">>, QueryWishlistsArgs>({
    query: queryDocument,
    variables: {
      storeId,
      userId,
      cultureName,
      currencyCode,
      sort,
      first: itemsPerPage,
      after: String((page - 1) * itemsPerPage),
    },
  });

  return data.wishlists;
}
