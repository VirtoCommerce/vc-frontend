import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import getAssignableCompanyRolesQueryDocument from "./getAssignableCompanyRolesQuery.graphql";
import type { OrganizationAssignableRolesArgs, Query, QueryOrganizationArgs, RoleType } from "@/core/api/graphql/types";

export async function getAssignableCompanyRoles(organizationId: string): Promise<RoleType[]> {
  const { userId, storeId } = globals;

  const { data } = await graphqlClient.query<
    Required<Pick<Query, "organization">>,
    QueryOrganizationArgs & OrganizationAssignableRolesArgs
  >({
    query: getAssignableCompanyRolesQueryDocument,
    variables: {
      id: organizationId,
      userId,
      storeId,
    },
  });

  return data.organization.assignableRoles ?? [];
}
