import { graphqlClient } from "@/core/api/graphql/client";
import { globals } from "@/core/globals";
import { CreateRequisitionDocument } from "../../types";

// The punchout session travels in the access token, so only the storefront context is passed
export async function createPunchoutRequisition() {
  const { storeId, cultureName, currencyCode } = globals;

  const { data } = await graphqlClient.mutate({
    mutation: CreateRequisitionDocument,
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
