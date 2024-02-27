import { graphqlClient } from "../../../client";
import { ChangeOrganizationContactRoleDocument } from "./changeOrganizationContactRole.generated";
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
    mutation: ChangeOrganizationContactRoleDocument,
    variables: {
      command: payload,
    },
  });

  return data?.changeOrganizationContactRole;
}
