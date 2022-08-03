import mutationDocument from "./inviteUserMutation.graphql";
import { CustomIdentityResultType, InputInviteUserType, Mutations, MutationsInviteUserArgs } from "@/xapi/types";

export default async function inviteUser(payload: InputInviteUserType): Promise<CustomIdentityResultType> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<Required<Pick<Mutations, "inviteUser">>, MutationsInviteUserArgs>({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });

  return data!.inviteUser;
}
