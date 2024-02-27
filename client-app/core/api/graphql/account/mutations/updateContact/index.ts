import { graphqlClient } from "../../../client";
import { UpdateContactDocument } from "./updateContactMutation.generated";
import type { InputUpdateContactType, Mutations, MutationsUpdateContactArgs } from "@/core/api/graphql/types";

export async function updateContact(contact: InputUpdateContactType): Promise<void> {
  await graphqlClient.mutate<Required<Pick<Mutations, "updateContact">>, MutationsUpdateContactArgs>({
    mutation: UpdateContactDocument,
    variables: {
      command: contact,
    },
  });
}
