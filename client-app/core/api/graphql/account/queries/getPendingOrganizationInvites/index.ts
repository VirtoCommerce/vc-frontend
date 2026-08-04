import { GetPendingOrganizationInvitesDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";
import type {
  GetPendingOrganizationInvitesQuery,
  GetPendingOrganizationInvitesQueryVariables,
} from "@/core/api/graphql/types";

type PendingOrganizationsConnectionType = NonNullable<
  NonNullable<NonNullable<GetPendingOrganizationInvitesQuery["me"]>["contact"]>["organizations"]
>;

export type PendingOrganizationInviteType = NonNullable<PendingOrganizationsConnectionType["items"]>[number];

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
