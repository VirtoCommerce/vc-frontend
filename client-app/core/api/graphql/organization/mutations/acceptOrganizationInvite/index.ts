import { graphqlClient } from "../../../client";
import mutationDocument from "./acceptOrganizationInvite.graphql";
import type { ContactType, Mutations, MutationsAcceptOrganizationInviteArgs } from "@/core/api/graphql/types";

export async function acceptOrganizationInvite(organizationId: string): Promise<ContactType> {
  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "acceptOrganizationInvite">>,
    MutationsAcceptOrganizationInviteArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: { organizationId },
    },
  });

  return data!.acceptOrganizationInvite;
}
