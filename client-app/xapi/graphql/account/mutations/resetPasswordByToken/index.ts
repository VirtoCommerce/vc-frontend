import {
  IdentityResultType,
  InputResetPasswordByTokenType,
  Mutations,
  MutationsResetPasswordByTokenArgs,
} from "@/xapi/types";
import mutationDocument from "./resetPasswordByToken.graphql";

export default async function resetPasswordByToken(
  payload: InputResetPasswordByTokenType
): Promise<IdentityResultType> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
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
