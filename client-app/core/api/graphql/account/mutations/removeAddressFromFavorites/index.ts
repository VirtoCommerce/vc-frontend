import { graphqlClient } from "../../../client";
import removeAddressFromFavoritesMutation from "./removeAddressFromFavoritesMutation.graphql";
import type {
  RemoveAddressFromFavoritesCommandType,
  MutationsRemoveAddressFromFavoritesArgs,
} from "@/core/api/graphql/types";

export async function removeAddressFromFavorites(addressId: string): Promise<void> {
  await graphqlClient.mutate<RemoveAddressFromFavoritesCommandType, MutationsRemoveAddressFromFavoritesArgs>({
    mutation: removeAddressFromFavoritesMutation,
    variables: {
      command: {
        addressId,
      },
    },
  });
}
