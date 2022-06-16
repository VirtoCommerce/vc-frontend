import queryDocument from "./getWishlist.graphql";
import { Query, QueryWishlistArgs, WishlistType } from "@/xapi/graphql/types";

export default async function getWishList(listId: string): Promise<WishlistType> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "wishlist">>, QueryWishlistArgs>({
    query: queryDocument,
    variables: {
      listId,
    },
  });

  return data.wishlist;
}
