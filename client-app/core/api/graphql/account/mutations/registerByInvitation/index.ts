import { graphqlClient } from "../../../client";
import { RegisterByInvitationDocument } from "./registerByInvitationMutation.generated";
import type {
  CustomIdentityResultType,
  InputRegisterByInvitationType,
  Mutations,
  MutationsRegisterByInvitationArgs,
} from "@/core/api/graphql/types";

export async function registerByInvitation(payload: InputRegisterByInvitationType): Promise<CustomIdentityResultType> {
  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "registerByInvitation">>,
    MutationsRegisterByInvitationArgs
  >({
    mutation: RegisterByInvitationDocument,
    variables: {
      command: payload,
    },
  });

  return data!.registerByInvitation;
}
