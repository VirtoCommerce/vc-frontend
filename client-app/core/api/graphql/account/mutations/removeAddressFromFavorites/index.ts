import { OperationNames } from "@/core/api/graphql/types";
import { filterActiveQueryNames } from "@/core/api/graphql/utils";
import { apolloClient, graphqlClient } from "../../../client";
import removeAddressFromFavoritesMutation from "./removeAddressFromFavoritesMutation.graphql";
import type {
  RemoveAddressFromFavoritesMutation,
  RemoveAddressFromFavoritesMutationVariables,
} from "@/core/api/graphql/types";

const ADDRESS_LIST_QUERIES = [
  OperationNames.Query.GetCurrentUserAddresses,
  OperationNames.Query.GetCurrentOrganizationAddresses,
];

export async function removeAddressFromFavorites(addressId: string): Promise<void> {
  await graphqlClient.mutate<RemoveAddressFromFavoritesMutation, RemoveAddressFromFavoritesMutationVariables>({
    mutation: removeAddressFromFavoritesMutation,
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
