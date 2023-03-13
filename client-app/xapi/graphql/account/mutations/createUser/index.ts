import mutationDocument from "./createUser.graphql";
import type {
  IdentityResultType,
  InputCreateApplicationUserType,
  Mutations,
  MutationsCreateUserArgs,
} from "@/xapi/types";

export default async function createUser(user: InputCreateApplicationUserType): Promise<IdentityResultType> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<Required<Pick<Mutations, "createUser">>, MutationsCreateUserArgs>({
    mutation: mutationDocument,
    variables: {
      command: { applicationUser: user },
    },
  });

  return data!.createUser;
}
