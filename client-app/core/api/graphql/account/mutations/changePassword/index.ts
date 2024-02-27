import { graphqlClient } from "../../../client";
import { ChangePasswordDocument } from "./changePassword.generated";
import type {
  IdentityResultType,
  InputChangePasswordType,
  Mutations,
  MutationsChangePasswordArgs,
} from "@/core/api/graphql/types";

export async function changePassword(payload: InputChangePasswordType): Promise<IdentityResultType> {
  const { data } = await graphqlClient.mutate<Required<Pick<Mutations, "changePassword">>, MutationsChangePasswordArgs>(
    {
      mutation: ChangePasswordDocument,
      variables: {
        command: payload,
      },
    },
  );

  return data!.changePassword;
}
