import client from "@core/api/graphql/graphql-client";
import mutationDocument from "./createContact.graphql";
import { ContactType, InputCreateContactType, Mutations, MutationsCreateContactArgs } from "@core/api/graphql/types";

export default async function createContact(contact: InputCreateContactType): Promise<ContactType> {
  const { data } = await client.mutate<Required<Pick<Mutations, "createContact">>, MutationsCreateContactArgs>({
    mutation: mutationDocument,
    variables: {
      command: contact,
    },
  });

  return data!.createContact;
}
