import { graphqlClient } from "../../../client";
import { AddAddressToFavoritesDocument } from "./addAddressToFavoritesMutation.generated";
import type {
  AddAddressToFavoritesMutation,
  AddAddressToFavoritesMutationVariables,
} from "./addAddressToFavoritesMutation.generated";

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
