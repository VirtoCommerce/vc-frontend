import { graphqlClient } from "../../../client";
import mutationDocument from "./rejectOrganizationInvite.graphql";
import type { ContactType, Mutations, MutationsRejectOrganizationInviteArgs } from "@/core/api/graphql/types";

export async function rejectOrganizationInvite(organizationId: string): Promise<ContactType> {
  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "rejectOrganizationInvite">>,
    MutationsRejectOrganizationInviteArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: { organizationId },
    },
  });

  return data!.rejectOrganizationInvite;
}
