import { graphqlClient } from "@/core/api/graphql/client";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { globals } from "@/core/globals";
import { UpdateMfaOrganizationModeDocument } from "../../types";
import type { UpdateMfaOrganizationModeMutation, UpdateMfaOrganizationModeMutationVariables } from "../../types";

export async function updateMfaOrganizationMode(
  organizationId: string,
  enabled: boolean,
  twoFactorToken: string,
  code: string,
): Promise<UpdateMfaOrganizationModeMutation["updateMfaOrganizationMode"]> {
  const { storeId } = globals;

  const { data } = await graphqlClient.mutate<
    UpdateMfaOrganizationModeMutation,
    UpdateMfaOrganizationModeMutationVariables
  >({
    mutation: UpdateMfaOrganizationModeDocument,
    variables: { command: { storeId, organizationId, enabled, twoFactorToken, code } },
    // The widget shows the error next to the switch or the code
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
  });

  return data?.updateMfaOrganizationMode;
}
