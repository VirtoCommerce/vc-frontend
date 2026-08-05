import { GetOrganizationsDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";
import type { GetOrganizationsQueryVariables, OrganizationFieldsFragment } from "@/core/api/graphql/types";

export type OrganizationFieldsType = OrganizationFieldsFragment;

interface IOrganizationsType {
  items: OrganizationFieldsType[];
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    endCursor?: string;
  };
}

export async function getOrganizations(payload: GetOrganizationsQueryVariables): Promise<IOrganizationsType> {
  const { data } = await graphqlClient.query({
    query: GetOrganizationsDocument,
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
