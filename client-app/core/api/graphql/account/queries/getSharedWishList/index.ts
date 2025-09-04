import { graphqlClient } from "../../../client";
import queryDocument from "./getSharedWishlist.graphql";
import type { Query, QuerySharedWishlistArgs, WishlistType } from "@/core/api/graphql/types";

export async function getSharedWishList(sharingKey: string): Promise<WishlistType> {
  const { data } = await graphqlClient.query<Required<Pick<Query, "sharedWishlist">>, QuerySharedWishlistArgs>({
    query: queryDocument,
    variables: {
      sharingKey,
    },
  });

  return data.sharedWishlist;
}
