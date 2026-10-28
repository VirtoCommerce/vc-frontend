import { OperationNames } from "@/core/api/graphql/types";
import { filterActiveQueryNames } from "@/core/api/graphql/utils";
import { graphqlClient } from "../../../client";
import removeAddressFromFavoritesMutation from "./removeAddressFromFavoritesMutation.graphql";
import type {
  RemoveAddressFromFavoritesMutation,
  RemoveAddressFromFavoritesMutationVariables,
} from "@/core/api/graphql/types";

export async function removeAddressFromFavorites(addressId: string): Promise<void> {
  await graphqlClient.mutate<RemoveAddressFromFavoritesMutation, RemoveAddressFromFavoritesMutationVariables>({
    mutation: removeAddressFromFavoritesMutation,
    variables: {
      command: {
        addressId,
      },
    },
    // The header ship-to and checkout lists are sorted by favorites too.
    refetchQueries: () => filterActiveQueryNames(graphqlClient, [OperationNames.Query.GetCurrentOrganizationAddresses]),
  });
}
