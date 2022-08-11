import { InputUpdateContactType, Mutations, MutationsUpdateContactArgs } from "@/xapi/types";
import mutationDocument from "./updateContactMutation.graphql";

export default async function updateContact(contact: InputUpdateContactType): Promise<void> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<Required<Pick<Mutations, "updateContact">>, MutationsUpdateContactArgs>({
    mutation: mutationDocument,
    variables: {
      command: contact,
    },
  });
}
