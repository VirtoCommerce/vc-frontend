import { ContactType, InputCreateContactType, Mutations, MutationsCreateContactArgs } from "./../../../types";

import client from "@core/api/graphql/graphql-client";

import mutationDocument from "./createContact.graphql";

export default async function createContact(contact: InputCreateContactType): Promise<ContactType> {
  const { data } = await client.mutate<Pick<Mutations, "createContact">, MutationsCreateContactArgs>({
    mutation: mutationDocument,
    variables: {
      command: contact,
    },
  });

  return data?.createContact as ContactType;
}
