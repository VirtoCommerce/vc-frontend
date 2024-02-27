import { graphqlClient } from "../../../client";
import { UpdateOrganizationDocument } from "./updateOrganizationMutation.generated";
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
    mutation: UpdateOrganizationDocument,
    variables: {
      command: payload,
    },
  });

  return data!.updateOrganization;
}
