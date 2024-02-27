import { graphqlClient } from "../../../client";
import { InviteUserDocument } from "./inviteUserMutation.generated";
import type {
  CustomIdentityResultType,
  InputInviteUserType,
  Mutations,
  MutationsInviteUserArgs,
} from "@/core/api/graphql/types";

export async function inviteUser(payload: InputInviteUserType): Promise<CustomIdentityResultType> {
  const { data } = await graphqlClient.mutate<Required<Pick<Mutations, "inviteUser">>, MutationsInviteUserArgs>({
    mutation: InviteUserDocument,
    variables: {
      command: payload,
    },
  });

  return data!.inviteUser;
}
