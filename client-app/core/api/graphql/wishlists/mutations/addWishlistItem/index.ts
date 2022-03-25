import client from "@core/api/graphql/graphql-client";
import mutationDocument from "./addWishlistItemMutation.graphql";
import {
  InputAddWishlistItemType,
  Mutations,
  MutationsAddWishlistItemArgs,
  WishlistType,
} from "@core/api/graphql/types";

export default async function addWishlistItem(payload: InputAddWishlistItemType): Promise<WishlistType> {
  const { data } = await client.mutate<Required<Pick<Mutations, "addWishlistItem">>, MutationsAddWishlistItemArgs>({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });

  return data!.addWishlistItem;
}
