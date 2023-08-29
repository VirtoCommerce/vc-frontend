import { graphqlClient } from "../../../client";
import mutationDocument from "./updateOrganizationMutation.graphql";
import type {
  InputUpdateOrganizationType,
  Mutations,
  MutationsUpdateOrganizationArgs,
  Organization,
} from "@/core/api/graphql/types";

export async function updateOrganization(payload: InputUpdateOrganizationType): Promise<Organization> {
  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "updateOrganization">>,
    MutationsUpdateOrganizationArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });

  return data!.updateOrganization;
}
