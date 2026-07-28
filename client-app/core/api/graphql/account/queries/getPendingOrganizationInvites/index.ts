import { GetPendingOrganizationInvitesDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";
import type { GetPendingOrganizationInvitesQueryVariables, Organization } from "@/core/api/graphql/types";

export type PendingOrganizationInviteType = Pick<Organization, "id" | "name" | "myStatusInOrganization">;

interface IPendingOrganizationInvitesResult {
  items: PendingOrganizationInviteType[];
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    endCursor?: string;
  };
}

export async function getPendingOrganizationInvites(
  payload: GetPendingOrganizationInvitesQueryVariables,
): Promise<IPendingOrganizationInvitesResult> {
  const { data } = await graphqlClient.query({
    query: GetPendingOrganizationInvitesDocument,
    variables: payload,
  });

  const organizations = data.me?.contact?.organizations;

  return {
    items: organizations?.items ?? [],
    totalCount: organizations?.totalCount ?? 0,
    pageInfo: {
      hasNextPage: organizations?.pageInfo?.hasNextPage ?? false,
      endCursor: organizations?.pageInfo?.endCursor,
    },
  };
}
