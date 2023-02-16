import globals from "@/core/globals";
import { Mutations, MutationsChangeCommentArgs } from "@/xapi/types";
import mutationDocument from "./changeCartCommentMutation.graphql";

export default async function changeCartComment(comment: string): Promise<void> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  await $graphqlClient.mutate<Required<Pick<Mutations, "changeComment">>, MutationsChangeCommentArgs>({
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
}
