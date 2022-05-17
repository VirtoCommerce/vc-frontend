import client from "@core/api/graphql/graphql-client";
import queryDocument from "./getWishlist.graphql";
import { Query, QueryWishlistArgs, WishlistType } from "@core/api/graphql/types";

export default async function getWishList(listId: string): Promise<WishlistType> {
  const { data } = await client.query<Required<Pick<Query, "wishlist">>, QueryWishlistArgs>({
    query: queryDocument,
    variables: {
      listId,
    },
  });

  return data.wishlist;
}
