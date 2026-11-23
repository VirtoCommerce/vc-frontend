import { AddAddressToFavoritesDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";
import { refetchAddressBooks } from "../refetchAddressBooks";

export async function addAddressToFavorites(addressId: string) {
  await graphqlClient.mutate({
    mutation: AddAddressToFavoritesDocument,
    variables: {
      command: {
        addressId,
      },
    },
  });

  refetchAddressBooks();
}
