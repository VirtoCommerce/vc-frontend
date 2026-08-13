import { graphqlClient } from "../../../client";
import mutationDocument from "./revokeOrganizationInvite.graphql";
import type { ContactType, Mutations, MutationsRevokeOrganizationInviteArgs } from "@/core/api/graphql/types";

export async function revokeOrganizationInvite(memberId: string): Promise<ContactType> {
  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "revokeOrganizationInvite">>,
    MutationsRevokeOrganizationInviteArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: { memberId },
    },
  });

  return data!.revokeOrganizationInvite;
}
