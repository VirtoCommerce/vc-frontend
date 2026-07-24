import { graphqlClient } from "../../../client";
import queryDocument from "./getPendingOrganizationInvites.graphql";
import type { Organization } from "@/core/api/graphql/types";

export type PendingOrganizationInviteType = Pick<Organization, "id" | "name" | "myStatusInOrganization">;

interface IPendingOrganizationInvitesResult {
  items: PendingOrganizationInviteType[];
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    endCursor?: string;
  };
}

interface IGetPendingOrganizationInvitesQuery {
  me?: {
    contact?: {
      organizations?: {
        items: PendingOrganizationInviteType[];
        totalCount: number;
        pageInfo: {
          hasNextPage: boolean;
          endCursor?: string;
        };
      };
    };
  };
}

export async function getPendingOrganizationInvites(payload: {
  after?: string;
  first?: number;
  statuses?: string[];
}): Promise<IPendingOrganizationInvitesResult> {
  const { data } = await graphqlClient.query<IGetPendingOrganizationInvitesQuery>({
    query: queryDocument,
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
