import client from "@core/api/graphql/graphql-client";
import mutationDocument from "./changeCartCommentMutation.graphql";
import { Mutations, MutationsChangeCommentArgs } from "@core/api/graphql/types";
import globals from "@core/globals";

export default async function changeCartComment(comment: string): Promise<void> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  await client.mutate<Required<Pick<Mutations, "changeComment">>, MutationsChangeCommentArgs>({
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
