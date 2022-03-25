import client from "@core/api/graphql/graphql-client";
import { IdentityResultType, InputCreateUserType, Mutations, MutationsCreateUserArgs } from "@core/api/graphql/types";
import mutationDocument from "./createUser.graphql";

export default async function createUser(user: InputCreateUserType): Promise<IdentityResultType | undefined> {
  const { data } = await client.mutate<Pick<Mutations, "createUser">, MutationsCreateUserArgs>({
    mutation: mutationDocument,
    variables: {
      command: user,
    },
  });

  return data?.createUser;
}
