import mutationDocument from "./unlockOrganizationContact.graphql";
import type { ContactType, Mutations, MutationsUnlockOrganizationContactArgs } from "@/xapi/types";

export default async function unlockOrganizationContact(userId: string): Promise<ContactType> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
    Required<Pick<Mutations, "unlockOrganizationContact">>,
    MutationsUnlockOrganizationContactArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: { userId },
    },
  });

  return data!.unlockOrganizationContact;
}
