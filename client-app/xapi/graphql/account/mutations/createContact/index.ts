import mutationDocument from "./createContact.graphql";
import { ContactType, InputCreateContactType, Mutations, MutationsCreateContactArgs } from "@/xapi/graphql/types";

export default async function createContact(contact: InputCreateContactType): Promise<ContactType> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<Required<Pick<Mutations, "createContact">>, MutationsCreateContactArgs>({
    mutation: mutationDocument,
    variables: {
      command: contact,
    },
  });

  return data!.createContact;
}
