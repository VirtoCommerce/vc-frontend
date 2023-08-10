import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import mutationDocument from "./addWishlistMutation.graphql";
import type { Mutations, MutationsCreateWishlistArgs, WishlistType } from "@/core/api/graphql/types";

export default async function addWishlist(listName?: string): Promise<WishlistType> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await graphqlClient.mutate<Required<Pick<Mutations, "createWishlist">>, MutationsCreateWishlistArgs>(
    {
      mutation: mutationDocument,
      variables: {
        command: {
          storeId,
          userId,
          cultureName,
          currencyCode,
          listName,
        },
      },
    },
  );

  return data!.createWishlist;
}
