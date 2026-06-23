import { graphqlClient } from "../../../client";
import mutationDocument from "./unlockOrganizationContact.graphql";
import type { ContactType, Mutations, MutationsUnlockOrganizationContactArgs } from "@/core/api/graphql/types";

export async function unlockOrganizationContact(memberId: string): Promise<ContactType> {
  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "unlockOrganizationContact">>,
    MutationsUnlockOrganizationContactArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: { memberId },
    },
  });

  return data!.unlockOrganizationContact;
}
