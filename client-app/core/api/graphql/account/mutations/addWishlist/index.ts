import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import mutationDocument from "./addWishlistMutation.graphql";
import type { Mutations, MutationsCreateWishlistArgs, WishlistType } from "@/core/api/graphql/types";
import type { CreateWishlistPayloadType } from "@/core/types";

export async function addWishlist(payload: CreateWishlistPayloadType): Promise<WishlistType> {
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
          ...payload,
        },
      },
    },
  );

  return data!.createWishlist;
}
