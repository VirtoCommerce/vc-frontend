import { graphqlClient } from "@/core/api/graphql/client";
import { globals } from "@/core/globals";
import { GetMfaSettingsDocument } from "../../types";
import type { GetMfaSettingsQuery, GetMfaSettingsQueryVariables } from "../../types";

export async function getMfaSettings(organizationId?: string): Promise<GetMfaSettingsQuery["mfaSettings"]> {
  const { storeId } = globals;

  const { data } = await graphqlClient.query<GetMfaSettingsQuery, GetMfaSettingsQueryVariables>({
    query: GetMfaSettingsDocument,
    variables: { storeId, organizationId },
    fetchPolicy: "no-cache",
  });

  return data.mfaSettings;
}
