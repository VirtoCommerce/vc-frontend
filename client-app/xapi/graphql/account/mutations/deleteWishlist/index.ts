import { Mutations, MutationsRemoveWishlistArgs } from "@/xapi/types";
import mutationDocument from "./deleteWishlistMutation.graphql";

export default async function deleteWishlist(listId: string): Promise<boolean> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
    Required<Pick<Mutations, "removeWishlist">>,
    MutationsRemoveWishlistArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: {
        listId,
      },
    },
  });

  return data!.removeWishlist;
}
