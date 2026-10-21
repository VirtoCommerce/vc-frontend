import { graphqlClient } from "../../../client";
import mutationDocument from "./updateContactMutation.graphql";
import type { ErrorNotificationsContextType } from "@/core/api/graphql/consts";
import type { InputUpdateContactType, Mutations, MutationsUpdateContactArgs } from "@/core/api/graphql/types";

export async function updateContact(
  contact: InputUpdateContactType,
  context?: ErrorNotificationsContextType,
): Promise<void> {
  await graphqlClient.mutate<Required<Pick<Mutations, "updateContact">>, MutationsUpdateContactArgs>({
    mutation: mutationDocument,
    variables: {
      command: contact,
    },
    context,
  });
}
