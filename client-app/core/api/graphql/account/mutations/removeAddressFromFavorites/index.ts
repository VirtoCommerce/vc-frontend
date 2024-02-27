import { graphqlClient } from "../../../client";
import { RemoveAddressFromFavoritesDocument } from "./removeAddressFromFavoritesMutation.generated";
import type {
  RemoveAddressFromFavoritesMutation,
  RemoveAddressFromFavoritesMutationVariables,
} from "./removeAddressFromFavoritesMutation.generated";

export async function removeAddressFromFavorites(addressId: string): Promise<void> {
  await graphqlClient.mutate<RemoveAddressFromFavoritesMutation, RemoveAddressFromFavoritesMutationVariables>({
    mutation: RemoveAddressFromFavoritesDocument,
    variables: {
      command: {
        addressId,
      },
    },
  });
}
