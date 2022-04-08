import client from "@core/api/graphql/graphql-client";
import queryDocument from "./getWishlist.graphql";
import { WishlistType } from "@core/api/graphql/types";

export default async function getWishList(listId: string): Promise<WishlistType> {
  const { data } = await client.query({
    query: queryDocument,
    variables: {
      listId,
    },
  });

  return data?.wishlist;
}
