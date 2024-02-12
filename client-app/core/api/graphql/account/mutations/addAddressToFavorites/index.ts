import { graphqlClient } from "../../../client";
import mutationDocument from "./addAddressToFavoritesMutation.graphql";
import type { Mutations, MutationsAddAddressToFavoritesArgs } from "@/core/api/graphql/types";

export async function addAddressToFavorites(addressId: string): Promise<void> {
  await graphqlClient.mutate<Required<Pick<Mutations, "addAddressToFavorites">>, MutationsAddAddressToFavoritesArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        addressId,
      },
    },
  });
}
