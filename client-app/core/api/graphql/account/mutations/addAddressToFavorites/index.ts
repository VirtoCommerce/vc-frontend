import { graphqlClient } from "../../../client";
import addAddressToFavoritesMutation from "./addAddressToFavoritesMutation.graphql";
import type { AddAddressToFavoritesCommandType, MutationsAddAddressToFavoritesArgs } from "@/core/api/graphql/types";

export async function addAddressToFavorites(addressId: string): Promise<void> {
  await graphqlClient.mutate<AddAddressToFavoritesCommandType, MutationsAddAddressToFavoritesArgs>({
    mutation: addAddressToFavoritesMutation,
    variables: {
      command: {
        addressId,
      },
    },
  });
}
