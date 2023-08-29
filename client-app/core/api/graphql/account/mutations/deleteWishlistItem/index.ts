import { graphqlClient } from "../../../client";
import mutationDocument from "./deleteWishlistItemMutation.graphql";
import type {
  InputRemoveWishlistItemType,
  Mutations,
  MutationsRemoveWishlistItemArgs,
  WishlistType,
} from "@/core/api/graphql/types";

export async function deleteWishlistItem(payload: InputRemoveWishlistItemType): Promise<WishlistType> {
  const { data } = await graphqlClient.mutate<
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
