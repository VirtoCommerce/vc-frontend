import mutationDocument from "./addWishlistItemMutation.graphql";
import {
  InputAddWishlistItemType,
  Mutations,
  MutationsAddWishlistItemArgs,
  WishlistType,
} from "@/xapi/graphql/types";

export default async function addWishlistItem(payload: InputAddWishlistItemType): Promise<WishlistType> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<Required<Pick<Mutations, "addWishlistItem">>, MutationsAddWishlistItemArgs>({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });

  return data!.addWishlistItem;
}
