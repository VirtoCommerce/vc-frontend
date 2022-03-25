import client from "@core/api/graphql/graphql-client";
import {
  IdentityResultType,
  InputCreateApplicationUserType,
  Mutations,
  MutationsCreateUserArgs,
} from "@core/api/graphql/types";
import mutationDocument from "./createUser.graphql";

export default async function createUser(user: InputCreateApplicationUserType): Promise<IdentityResultType> {
  const { data } = await client.mutate<Pick<Mutations, "createUser">, MutationsCreateUserArgs>({
    mutation: mutationDocument,
    variables: {
      command: { applicationUser: user },
    },
  });

  return data?.createUser as IdentityResultType;
}
