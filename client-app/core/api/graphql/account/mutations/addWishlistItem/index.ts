import { graphqlClient } from "../../../client";
import { AddWishlistItemDocument } from "./addWishlistItemMutation.generated";
import type {
  InputAddWishlistItemType,
  Mutations,
  MutationsAddWishlistItemArgs,
  WishlistType,
} from "@/core/api/graphql/types";

export async function addWishlistItem(payload: InputAddWishlistItemType): Promise<WishlistType> {
  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "addWishlistItem">>,
    MutationsAddWishlistItemArgs
  >({
    mutation: AddWishlistItemDocument,
    variables: {
      command: payload,
    },
  });

  return data!.addWishlistItem;
}
