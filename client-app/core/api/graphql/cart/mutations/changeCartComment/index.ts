import client from "@core/api/graphql/graphql-client";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import mutationDocument from "./changeCartCommentMutation.graphql";
import { Mutations, MutationsChangeCommentArgs } from "@core/api/graphql/types";

export default async function changeCartComment(comment: string): Promise<void> {
  await client.mutate<Required<Pick<Mutations, "changeComment">>, MutationsChangeCommentArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        comment,
        storeId,
        currencyCode,
        cultureName: locale,
        userId: currentUserId,
      },
    },
  });
}
