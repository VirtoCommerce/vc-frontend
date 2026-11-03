import { graphqlClient } from "@/core/api/graphql/client";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { globals } from "@/core/globals";
import { UpdateMfaUserModeDocument } from "../../types";
import type { UpdateMfaUserModeMutation, UpdateMfaUserModeMutationVariables } from "../../types";

export async function updateMfaUserMode(
  enabled: boolean,
  twoFactorToken: string,
  code: string,
): Promise<UpdateMfaUserModeMutation["updateMfaUserMode"]> {
  const { storeId } = globals;

  const { data } = await graphqlClient.mutate<UpdateMfaUserModeMutation, UpdateMfaUserModeMutationVariables>({
    mutation: UpdateMfaUserModeDocument,
    variables: { command: { storeId, enabled, twoFactorToken, code } },
    // The widget shows the error next to the switch or the code
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
  });

  return data?.updateMfaUserMode;
}
