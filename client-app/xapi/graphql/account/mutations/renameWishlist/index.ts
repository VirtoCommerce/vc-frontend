import mutationDocument from "./renameWishlistMutation.graphql";
import { InputRenameWishlistType, Mutations, MutationsRenameWishlistArgs, WishlistType } from "@/xapi/graphql/types";

export default async function renameWishlist(payload: InputRenameWishlistType): Promise<WishlistType> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
    Required<Pick<Mutations, "renameWishlist">>,
    MutationsRenameWishlistArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });

  return data!.renameWishlist;
}
