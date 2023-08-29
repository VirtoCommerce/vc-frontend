import { graphqlClient } from "../../../client";
import mutationDocument from "./resetPasswordByToken.graphql";
import type {
  IdentityResultType,
  InputResetPasswordByTokenType,
  Mutations,
  MutationsResetPasswordByTokenArgs,
} from "@/core/api/graphql/types";

export async function resetPasswordByToken(payload: InputResetPasswordByTokenType): Promise<IdentityResultType> {
  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "resetPasswordByToken">>,
    MutationsResetPasswordByTokenArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });

  return data!.resetPasswordByToken;
}
