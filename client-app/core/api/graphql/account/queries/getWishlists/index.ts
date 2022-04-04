import client from "@core/api/graphql/graphql-client";
import { currencyCode, currentUserId, defaultPageSize, locale, storeId } from "@core/constants";
import queryDocument from "./getWishlists.graphql";
import { Query, QueryWishlistsArgs, WishlistConnection } from "@core/api/graphql/types";
import { WishlistsSearchParams } from "@core/api/graphql/account";

export default async function getWishlists({
  itemsPerPage = defaultPageSize,
  page = 1,
  sort,
}: Partial<WishlistsSearchParams>): Promise<WishlistConnection> {
  const { data } = await client.query<Required<Pick<Query, "wishlists">>, QueryWishlistsArgs>({
    query: queryDocument,
    variables: {
      storeId,
      currencyCode,
      cultureName: locale,
      userId: currentUserId,
      sort,
      first: itemsPerPage,
      after: String((page - 1) * itemsPerPage),
    },
  });

  return data.wishlists;
}
