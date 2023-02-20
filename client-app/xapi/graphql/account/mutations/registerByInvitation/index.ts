import {
  CustomIdentityResultType,
  InputRegisterByInvitationType,
  Mutations,
  MutationsRegisterByInvitationArgs,
} from "@/xapi/types";
import mutationDocument from "./registerByInvitationMutation.graphql";

export default async function registerByInvitation(
  payload: InputRegisterByInvitationType
): Promise<CustomIdentityResultType> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
    Required<Pick<Mutations, "registerByInvitation">>,
    MutationsRegisterByInvitationArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });

  return data!.registerByInvitation;
}
