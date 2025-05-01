import { AddAddressToFavoritesDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";
import type { AddAddressToFavoritesMutation, AddAddressToFavoritesMutationVariables } from "@/core/api/graphql/types";

export async function addAddressToFavorites(addressId: string): Promise<void> {
  await graphqlClient.mutate<AddAddressToFavoritesMutation, AddAddressToFavoritesMutationVariables>({
    mutation: AddAddressToFavoritesDocument,
    variables: {
      command: {
        addressId,
      },
    },
  });
}
