import client from "@core/api/graphql/graphql-client";
import mutationDocument from "./removeWishlistItemMutation.graphql";
import {
  InputRemoveWishlistItemType,
  Mutations,
  MutationsRemoveWishlistItemArgs,
  WishlistType,
} from "@core/api/graphql/types";

export default async function removeWishlistItem(payload: InputRemoveWishlistItemType): Promise<WishlistType> {
  const { data } = await client.mutate<
    Required<Pick<Mutations, "removeWishlistItem">>,
    MutationsRemoveWishlistItemArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });

  return data!.removeWishlistItem;
}
