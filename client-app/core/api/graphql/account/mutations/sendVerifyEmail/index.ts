import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import { SendVerifyEmailDocument } from "./sendVerifyEmailMutation.generated";
import type { Mutations, MutationsSendVerifyEmailArgs } from "@/core/api/graphql/types";

export async function sendVerifyEmail(userId: string): Promise<boolean | undefined> {
  const { storeId, cultureName } = globals;

  const response = await graphqlClient.mutate<
    Required<Pick<Mutations, "sendVerifyEmail">>,
    MutationsSendVerifyEmailArgs
  >({
    mutation: SendVerifyEmailDocument,
    variables: {
      command: {
        userId,
        storeId,
        languageCode: cultureName,
      },
    },
  });

  return response?.data?.sendVerifyEmail;
}
