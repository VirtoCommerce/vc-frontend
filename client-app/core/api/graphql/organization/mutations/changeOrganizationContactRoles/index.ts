import { graphqlClient } from "../../../client";
import mutationDocument from "./changeOrganizationContactRole.graphql";
import type {
  CustomIdentityResultType,
  InputChangeOrganizationContactRoleType,
  Mutations,
  MutationsChangeOrganizationContactRoleArgs,
} from "@/core/api/graphql/types";

export async function changeOrganizationContactRole(
  payload: InputChangeOrganizationContactRoleType,
): Promise<CustomIdentityResultType | undefined> {
  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "changeOrganizationContactRole">>,
    MutationsChangeOrganizationContactRoleArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });

  return data?.changeOrganizationContactRole;
}
