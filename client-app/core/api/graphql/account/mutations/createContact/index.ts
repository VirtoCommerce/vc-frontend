import { graphqlClient } from "../../../client";
import mutationDocument from "./createContact.graphql";
import type {
  ContactType,
  InputCreateContactType,
  Mutations,
  MutationsCreateContactArgs,
} from "@/core/api/graphql/types";

export async function createContact(contact: InputCreateContactType): Promise<ContactType> {
  const { data } = await graphqlClient.mutate<Required<Pick<Mutations, "createContact">>, MutationsCreateContactArgs>({
    mutation: mutationDocument,
    variables: {
      command: contact,
    },
  });

  return data!.createContact;
}
