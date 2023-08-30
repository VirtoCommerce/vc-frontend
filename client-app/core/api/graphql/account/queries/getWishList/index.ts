import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import queryDocument from "./getWishlist.graphql";
import type { Query, QueryWishlistArgs, WishlistType } from "@/core/api/graphql/types";

export async function getWishList(listId: string): Promise<WishlistType> {
  const { cultureName } = globals;

  const { data } = await graphqlClient.query<Required<Pick<Query, "wishlist">>, QueryWishlistArgs>({
    query: queryDocument,
    variables: {
      cultureName,
      listId,
    },
  });

  return data.wishlist;
}
