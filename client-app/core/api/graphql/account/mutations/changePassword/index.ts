import { graphqlClient } from "../../../client";
import mutationDocument from "./changePassword.graphql";
import type {
  IdentityResultType,
  InputChangePasswordType,
  Mutations,
  MutationsChangePasswordArgs,
} from "@/core/api/graphql/types";

export default async function resetPasswordByToken(payload: InputChangePasswordType): Promise<IdentityResultType> {
  const { data } = await graphqlClient.mutate<Required<Pick<Mutations, "changePassword">>, MutationsChangePasswordArgs>(
    {
      mutation: mutationDocument,
      variables: {
        command: payload,
      },
    },
  );

  return data!.changePassword;
}
