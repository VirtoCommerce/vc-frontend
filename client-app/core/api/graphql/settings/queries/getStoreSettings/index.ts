import { graphqlClient } from "../../../client";
import getStoreSettingsDocument from "./getStoreSettings.graphql";
import type { GetStoreSettingsQuery, GetStoreSettingsQueryVariables } from "@/core/api/graphql/types";

export async function getStoreSettings(storeId: string): Promise<GetStoreSettingsQuery["store"]> {
  const { data } = await graphqlClient.query<GetStoreSettingsQuery, GetStoreSettingsQueryVariables>({
    query: getStoreSettingsDocument,
    variables: {
      storeId,
    },
  });

  return data.store;
}
