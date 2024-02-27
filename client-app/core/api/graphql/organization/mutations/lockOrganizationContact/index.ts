import { graphqlClient } from "../../../client";
import { LockOrganizationContactDocument } from "./lockOrganizationContact.generated";
import type { ContactType, Mutations, MutationsLockOrganizationContactArgs } from "@/core/api/graphql/types";

export async function lockOrganizationContact(userId: string): Promise<ContactType> {
  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "lockOrganizationContact">>,
    MutationsLockOrganizationContactArgs
  >({
    mutation: LockOrganizationContactDocument,
    variables: {
      command: { userId },
    },
  });

  return data!.lockOrganizationContact;
}
