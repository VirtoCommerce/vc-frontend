import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import mutationDocument from "./sendVerifyEmailMutation.graphql";
import type { Mutations, MutationsSendVerifyEmailArgs } from "@/core/api/graphql/types";

export default async function sendVerifyEmail(userId: string): Promise<void> {
  const { storeId, cultureName } = globals;

  await graphqlClient.mutate<Required<Pick<Mutations, "sendVerifyEmail">>, MutationsSendVerifyEmailArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        userId,
        storeId,
        languageCode: cultureName,
      },
    },
  });
}
