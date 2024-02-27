import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import { GetWishlistDocument } from "./getWishlist.generated";
import type { Query, QueryWishlistArgs, WishlistType } from "@/core/api/graphql/types/base.generated";

export async function getWishList(listId: string): Promise<WishlistType> {
  const { cultureName } = globals;

  const { data } = await graphqlClient.query<Required<Pick<Query, "wishlist">>, QueryWishlistArgs>({
    query: GetWishlistDocument,
    variables: {
      cultureName,
      listId,
    },
  });

  return data.wishlist;
}
