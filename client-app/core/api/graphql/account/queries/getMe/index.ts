import { useLazyQuery } from "@vue/apollo-composable";
import { graphqlClient } from "../../../client";
import { GetMeDocument } from "./getMeQuery.generated";
import type { ContactTypeOrganizationsArgs, Query, UserType } from "@/core/api/graphql/types/base.generated";

export function useGetMeQuery() {
  return useLazyQuery(GetMeDocument);
}

export async function getMe(): Promise<UserType> {
  const { data } = await graphqlClient.query<Required<Pick<Query, "me">>, ContactTypeOrganizationsArgs>({
    query: GetMeDocument,
  });

  return data.me;
}
