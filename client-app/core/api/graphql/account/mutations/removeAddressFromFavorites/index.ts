import { graphqlClient } from "../../../client";
import mutationDocument from "./removeAddressFromFavoritesMutation.graphql";
import type { Mutations, MutationsRemoveAddressFromFavoritesArgs } from "@/core/api/graphql/types";

export async function removeAddressFromFavorites(addressId: string): Promise<void> {
  await graphqlClient.mutate<
    Required<Pick<Mutations, "removeAddressFromFavorites">>,
    MutationsRemoveAddressFromFavoritesArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: {
        addressId,
      },
    },
  });
}
