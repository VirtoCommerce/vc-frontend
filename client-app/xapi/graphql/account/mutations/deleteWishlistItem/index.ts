import mutationDocument from "./deleteWishlistItemMutation.graphql";
import { InputRemoveWishlistItemType, Mutations, MutationsRemoveWishlistItemArgs, WishlistType } from "@/xapi/types";

export default async function deleteWishlistItem(payload: InputRemoveWishlistItemType): Promise<WishlistType> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
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
