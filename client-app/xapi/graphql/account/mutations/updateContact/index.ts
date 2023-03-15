import mutationDocument from "./updateContactMutation.graphql";
import type { InputUpdateContactType, Mutations, MutationsUpdateContactArgs } from "@/xapi/types";

export default async function updateContact(contact: InputUpdateContactType): Promise<void> {
  const { $graphqlClient } = useNuxtApp();

  await $graphqlClient.mutate<Required<Pick<Mutations, "updateContact">>, MutationsUpdateContactArgs>({
    mutation: mutationDocument,
    variables: {
      command: contact,
    },
  });
}
