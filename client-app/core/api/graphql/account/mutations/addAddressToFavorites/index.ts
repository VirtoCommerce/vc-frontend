import { graphqlClient } from "../../../client";
import addAddressToFavoritesMutation from "./addAddressToFavoritesMutation.graphql";
import type { AddAddressToFavoritesMutation, AddAddressToFavoritesMutationVariables } from "@/core/api/graphql/types";

export async function addAddressToFavorites(addressId: string): Promise<void> {
  await graphqlClient.mutate<AddAddressToFavoritesMutation, AddAddressToFavoritesMutationVariables>({
    mutation: addAddressToFavoritesMutation,
    variables: {
      command: {
        addressId,
      },
    },
  });
}
