import { ContactType, Mutations, MutationsLockOrganizationContactArgs } from "@/xapi/types";
import mutationDocument from "./lockOrganizationContact.graphql";

export default async function lockOrganizationContact(userId: string): Promise<ContactType> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
    Required<Pick<Mutations, "lockOrganizationContact">>,
    MutationsLockOrganizationContactArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: { userId },
    },
  });

  return data!.lockOrganizationContact;
}
