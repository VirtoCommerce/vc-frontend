import { graphqlClient } from "../../../client";
import mutationDocument from "./deleteWishlistMutation.graphql";
import type { Mutations, MutationsRemoveWishlistArgs } from "@/core/api/graphql/types";

export async function deleteWishlist(listId: string): Promise<boolean> {
  const { data } = await graphqlClient.mutate<Required<Pick<Mutations, "removeWishlist">>, MutationsRemoveWishlistArgs>(
    {
      mutation: mutationDocument,
      variables: {
        command: {
          listId,
        },
      },
    },
  );

  return data!.removeWishlist;
}
