import client from "@core/api/graphql/graphql-client";
import { UserType } from "@core/api/graphql/types";
import getMeQueryDocument from "./getMeQuery.graphql";

export default async function getMe(): Promise<UserType> {
  const { data } = await client.query({
    query: getMeQueryDocument,
  });
  return data?.me;
}
