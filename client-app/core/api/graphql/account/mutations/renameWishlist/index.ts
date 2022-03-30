import client from "@core/api/graphql/graphql-client";
import mutationDocument from "./renameWishlistMutation.graphql";
import { InputRenameWishlistType, Mutations, MutationsRenameWishlistArgs, WishlistType } from "@core/api/graphql/types";

export default async function renameWishlist(payload: InputRenameWishlistType): Promise<WishlistType> {
  const { data } = await client.mutate<Required<Pick<Mutations, "renameWishlist">>, MutationsRenameWishlistArgs>({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });

  return data!.renameWishlist;
}
