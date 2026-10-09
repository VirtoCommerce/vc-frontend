import { graphqlClient } from "../../../client";
import mutationDocument from "./resendOrganizationInvite.graphql";
import type {
  CustomIdentityResultType,
  InputResendOrganizationInviteType,
  Mutations,
  MutationsResendOrganizationInviteArgs,
} from "@/core/api/graphql/types";

export async function resendOrganizationInvite(
  payload: InputResendOrganizationInviteType,
): Promise<CustomIdentityResultType> {
  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "resendOrganizationInvite">>,
    MutationsResendOrganizationInviteArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });

  return data!.resendOrganizationInvite;
}
