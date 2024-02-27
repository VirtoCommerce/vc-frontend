import { DEFAULT_PAGE_SIZE } from "@/core/constants";
import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import { GetWishlistsDocument } from "./getWishlists.generated";
import type { WishlistsSearchParams } from "@/core/api/graphql/account/types";
import type { Query, QueryWishlistsArgs, WishlistConnection } from "@/core/api/graphql/types/base.generated";

export async function getWishlists({
  itemsPerPage = DEFAULT_PAGE_SIZE,
  page = 1,
  sort,
}: Partial<WishlistsSearchParams>): Promise<WishlistConnection> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await graphqlClient.query<Required<Pick<Query, "wishlists">>, QueryWishlistsArgs>({
    query: GetWishlistsDocument,
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
