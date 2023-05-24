import globals from "@/core/globals";
import mutationDocument from "./changeCartCommentMutation.graphql";
import type { CartType, Mutations, MutationsChangeCommentArgs } from "@/xapi/types";

export async function changeCartComment(comment: string): Promise<CartType> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<Required<Pick<Mutations, "changeComment">>, MutationsChangeCommentArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId,
        userId,
        cultureName,
        currencyCode,
        comment,
      },
    },
  });

  return data!.changeComment;
}
