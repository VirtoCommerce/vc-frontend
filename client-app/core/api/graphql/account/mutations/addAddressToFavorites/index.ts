import { AddAddressToFavoritesDocument, OperationNames } from "@/core/api/graphql/types";
import { filterActiveQueryNames } from "@/core/api/graphql/utils";
import { graphqlClient } from "../../../client";

export async function addAddressToFavorites(addressId: string) {
  await graphqlClient.mutate({
    mutation: AddAddressToFavoritesDocument,
    variables: {
      command: {
        addressId,
      },
    },
    // The header ship-to and checkout lists are sorted by favorites too.
    refetchQueries: () => filterActiveQueryNames(graphqlClient, [OperationNames.Query.GetCurrentOrganizationAddresses]),
  });
}
