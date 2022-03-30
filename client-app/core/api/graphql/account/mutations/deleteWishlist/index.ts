import client from "@core/api/graphql/graphql-client";
import mutationDocument from "./deleteWishlistMutation.graphql";
import { Mutations, MutationsRemoveWishlistArgs } from "@core/api/graphql/types";

export default async function deleteWishlist(listId: string): Promise<boolean> {
  const { data } = await client.mutate<Required<Pick<Mutations, "removeWishlist">>, MutationsRemoveWishlistArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        listId,
      },
    },
  });

  return data!.removeWishlist;
}
