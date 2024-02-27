import { graphqlClient } from "../../../client";
import { UnlockOrganizationContactDocument } from "./unlockOrganizationContact.generated";
import type { ContactType, Mutations, MutationsUnlockOrganizationContactArgs } from "@/core/api/graphql/types";

export async function unlockOrganizationContact(userId: string): Promise<ContactType> {
  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "unlockOrganizationContact">>,
    MutationsUnlockOrganizationContactArgs
  >({
    mutation: UnlockOrganizationContactDocument,
    variables: {
      command: { userId },
    },
  });

  return data!.unlockOrganizationContact;
}
