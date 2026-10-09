import { AddAddressToFavoritesDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";

export async function addAddressToFavorites(addressId: string) {
  await graphqlClient.mutate({
    mutation: AddAddressToFavoritesDocument,
    variables: {
      command: {
        addressId,
      },
    },
  });
}
