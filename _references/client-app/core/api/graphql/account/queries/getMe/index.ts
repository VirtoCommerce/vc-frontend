import client from "@core/api/graphql/graphql-client";
import { UserType } from '@core/api/graphql/types';
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import getMeQueryDocument from './getMeQuery.graphql';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getMe(): Promise<UserType> {
  const { data } = await client.query({
    query: getMeQueryDocument
  });
  return data?.me;
}
export default getMe;
