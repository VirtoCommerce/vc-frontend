import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import mutationDocument from "./sendPasswordResetEmail.graphql";
import type {
  SendPasswordResetEmailCommandType,
  Mutations,
  MutationsSendPasswordResetEmailArgs,
} from "@/core/api/graphql/types";

export async function sendPasswordResetEmail(payload: SendPasswordResetEmailCommandType): Promise<boolean | undefined> {
  const { storeId, cultureName } = globals;

  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "sendPasswordResetEmail">>,
    MutationsSendPasswordResetEmailArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: {
        cultureName,
        storeId,
        ...payload,
      },
    },
  });

  return data?.sendPasswordResetEmail;
}
