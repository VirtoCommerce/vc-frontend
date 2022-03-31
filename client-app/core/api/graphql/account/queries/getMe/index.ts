import client from "@core/api/graphql/graphql-client";
import { ContactTypeOrganizationsArgs, Query, UserType } from "@core/api/graphql/types";
import getMeQueryDocument from "./getMeQuery.graphql";

export default async function getMe(): Promise<UserType> {
  const { data } = await client.query<Pick<Query, "me">, ContactTypeOrganizationsArgs>({
    query: getMeQueryDocument,
    variables: {
      first: 1,
      after: "0",
    },
  });
  return data?.me as UserType;
}
