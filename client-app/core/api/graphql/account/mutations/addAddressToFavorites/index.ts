import { AddAddressToFavoritesDocument, OperationNames } from "@/core/api/graphql/types";
import { filterActiveQueryNames } from "@/core/api/graphql/utils";
import { apolloClient, graphqlClient } from "../../../client";

const ADDRESS_LIST_QUERIES = [
  OperationNames.Query.GetCurrentUserAddresses,
  OperationNames.Query.GetCurrentOrganizationAddresses,
];

export async function addAddressToFavorites(addressId: string) {
  await graphqlClient.mutate({
    mutation: AddAddressToFavoritesDocument,
    variables: {
      command: {
        addressId,
      },
    },
  });

  await apolloClient.refetchQueries({
    include: filterActiveQueryNames(apolloClient, ADDRESS_LIST_QUERIES),
  });
}
