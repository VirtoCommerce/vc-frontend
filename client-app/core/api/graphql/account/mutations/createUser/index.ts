import { graphqlClient } from "../../../client";
import { CreateUserDocument } from "./createUser.generated";
import type {
  IdentityResultType,
  InputCreateApplicationUserType,
  Mutations,
  MutationsCreateUserArgs,
} from "@/core/api/graphql/types";

export async function createUser(user: InputCreateApplicationUserType): Promise<IdentityResultType> {
  const { data } = await graphqlClient.mutate<Required<Pick<Mutations, "createUser">>, MutationsCreateUserArgs>({
    mutation: CreateUserDocument,
    variables: {
      command: { applicationUser: user },
    },
  });

  return data!.createUser;
}
