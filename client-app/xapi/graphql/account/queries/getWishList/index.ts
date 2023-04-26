import globals from "@/core/globals";
import queryDocument from "./getWishlist.graphql";
import type { Query, QueryWishlistArgs, WishlistType } from "@/xapi/types";

export default async function getWishList(listId: string): Promise<WishlistType> {
  const { cultureName } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "wishlist">>, QueryWishlistArgs>({
    query: queryDocument,
    variables: {
      cultureName,
      listId,
    },
  });

  return data.wishlist;
}
