import { graphqlClient } from "../../../client";
import mutationDocument from "./createUser.graphql";
import type {
  IdentityResultType,
  InputCreateApplicationUserType,
  Mutations,
  MutationsCreateUserArgs,
} from "@/core/api/graphql/types";

export async function createUser(user: InputCreateApplicationUserType): Promise<IdentityResultType> {
  const { data } = await graphqlClient.mutate<Required<Pick<Mutations, "createUser">>, MutationsCreateUserArgs>({
    mutation: mutationDocument,
    variables: {
      command: { applicationUser: user },
    },
  });

  return data!.createUser;
}
