import { graphqlClient } from "@/core/api/graphql/client";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { globals } from "@/core/globals";
import { CreatePunchoutRequisitionDocument } from "../../types";

// The punchout session travels in the access token, so only the storefront context is passed
export async function createPunchoutRequisition() {
  const { storeId, cultureName, currencyCode } = globals;

  const { data } = await graphqlClient.mutate({
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
    mutation: CreatePunchoutRequisitionDocument,
    variables: {
      command: {
        storeId,
        cultureName,
        currencyCode,
      },
    },
  });

  return data?.createPunchoutRequisition;
}
