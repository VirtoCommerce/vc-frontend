import { ContactType, Mutations, MutationsUnlockOrganizationContactArgs } from "@/xapi/types";
import mutationDocument from "./unlockOrganizationContact.graphql";

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
