import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import getOrganizationContactRolesQueryDocument from "./getOrganizationContactRolesQuery.graphql";
import type { Query, QueryOrganizationArgs, RoleType } from "@/core/api/graphql/types";

export async function getOrganizationContactRoles(organizationId: string): Promise<RoleType[]> {
  const { userId } = globals;

  const { data } = await graphqlClient.query<Required<Pick<Query, "organization">>, QueryOrganizationArgs>({
    query: getOrganizationContactRolesQueryDocument,
    variables: {
      id: organizationId,
      userId,
    },
  });

  return data.organization.contactRoles ?? [];
}
