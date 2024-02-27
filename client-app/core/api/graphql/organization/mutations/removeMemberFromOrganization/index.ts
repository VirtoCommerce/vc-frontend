import { graphqlClient } from "../../../client";
import { RemoveMemberFromOrganizationDocument } from "./removeMemberFromOrganization.generated";
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
    mutation: RemoveMemberFromOrganizationDocument,
    variables: {
      command: payload,
    },
  });
}
