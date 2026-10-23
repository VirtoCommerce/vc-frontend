import { graphqlClient } from "@/core/api/graphql/client";
import { globals } from "@/core/globals";
import { GetSavedPaymentMethodsDocument } from "../../types";
import type { GetSavedPaymentMethodsQuery } from "../../types";

export async function getSavedPaymentMethods(): Promise<GetSavedPaymentMethodsQuery["savedPaymentMethods"]> {
  const { data } = await graphqlClient.query({
    query: GetSavedPaymentMethodsDocument,
    variables: { storeId: globals.storeId ?? "" },
    fetchPolicy: "network-only",
  });

  return data.savedPaymentMethods;
}
