import { graphqlClient } from "../../../client";
import { CreateContactDocument } from "./createContact.generated";
import type {
  ContactType,
  InputCreateContactType,
  Mutations,
  MutationsCreateContactArgs,
} from "@/core/api/graphql/types";

export async function createContact(contact: InputCreateContactType): Promise<ContactType> {
  const { data } = await graphqlClient.mutate<Required<Pick<Mutations, "createContact">>, MutationsCreateContactArgs>({
    mutation: CreateContactDocument,
    variables: {
      command: contact,
    },
  });

  return data!.createContact;
}
