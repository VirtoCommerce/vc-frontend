import { graphqlClient } from "../../../client";
import mutationDocument from "./removeMemberFromOrganization.graphql";
import type {
  InputRemoveMemberFromOrganizationType,
  Mutations,
  MutationsRemoveMemberFromOrganizationArgs,
} from "@/core/api/graphql/types";

export async function removeMemberFromOrganization(payload: InputRemoveMemberFromOrganizationType): Promise<void> {
  await graphqlClient.mutate<
    Required<Pick<Mutations, "removeMemberFromOrganization">>,
    MutationsRemoveMemberFromOrganizationArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });
}
