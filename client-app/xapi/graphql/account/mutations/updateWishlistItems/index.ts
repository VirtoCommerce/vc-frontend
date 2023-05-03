import mutationDocument from "./updateWishlistItemsMutation.graphql";
import type { InputUpdateWishlistItemsType, Mutations, MutationsUpdateWishListItemsArgs } from "@/xapi/types";

export default async function updateWishlistItems(payload: InputUpdateWishlistItemsType): Promise<void> {
  const { $graphqlClient } = useNuxtApp();

  await $graphqlClient.mutate<Required<Pick<Mutations, "updateWishListItems">>, MutationsUpdateWishListItemsArgs>({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });
}
