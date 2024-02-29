import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import mutationDocument from "./changeWishlistMutation.graphql";
import type { Mutations, MutationsChangeWishlistArgs, WishlistType } from "@/core/api/graphql/types";
import type { ChangeWishlistPayloadType } from "@/core/types";

export async function changeWishlist(payload: ChangeWishlistPayloadType): Promise<WishlistType> {
  const { cultureName } = globals;

  const { data } = await graphqlClient.mutate<Required<Pick<Mutations, "changeWishlist">>, MutationsChangeWishlistArgs>(
    {
      mutation: mutationDocument,
      variables: {
        command: {
          ...payload,
          cultureName,
        },
      },
    },
  );

  return data!.changeWishlist;
}
