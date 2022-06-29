import mutationDocument from "./addWishlistMutation.graphql";
import { Mutations, MutationsCreateWishlistArgs, WishlistType } from "@/xapi/types";
import globals from "@/core/globals";

export default async function addWishlist(listName?: string): Promise<WishlistType> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
    Required<Pick<Mutations, "createWishlist">>,
    MutationsCreateWishlistArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId,
        userId,
        cultureName,
        currencyCode,
        listName,
      },
    },
  });

  return data!.createWishlist;
}
