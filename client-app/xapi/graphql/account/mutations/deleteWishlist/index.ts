import mutationDocument from "./deleteWishlistMutation.graphql";
import { Mutations, MutationsRemoveWishlistArgs } from "@/xapi/graphql/types";

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
