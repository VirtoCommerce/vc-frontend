import { graphqlClient } from "@/core/api/graphql/client";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { globals } from "@/core/globals";
import { GetMfaSettingsWithLockoutDocument } from "../../types";
import type { GetMfaSettingsWithLockoutQuery, GetMfaSettingsWithLockoutQueryVariables } from "../../types";

export async function getMfaSettingsWithLockout(
  organizationId?: string,
): Promise<GetMfaSettingsWithLockoutQuery["mfaSettings"]> {
  const { storeId } = globals;

  const { data } = await graphqlClient.query<GetMfaSettingsWithLockoutQuery, GetMfaSettingsWithLockoutQueryVariables>({
    query: GetMfaSettingsWithLockoutDocument,
    variables: { storeId, organizationId },
    fetchPolicy: "no-cache",
    // The widget reports a failure itself, or hides when the settings do not load
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
  });

  return data.mfaSettings;
}
