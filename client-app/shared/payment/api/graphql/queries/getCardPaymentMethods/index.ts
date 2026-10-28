import { graphqlClient } from "@/core/api/graphql/client";
import { globals } from "@/core/globals";
import { GetCardPaymentMethodsDocument } from "../../types";
import type { GetCardPaymentMethodsQuery } from "../../types";

/** The store's payment methods that can save cards, with the public parameters their card forms need. */
export async function getCardPaymentMethods(): Promise<GetCardPaymentMethodsQuery["cardPaymentMethods"]> {
  const { data } = await graphqlClient.query({
    query: GetCardPaymentMethodsDocument,
    variables: { storeId: globals.storeId ?? "" },
    fetchPolicy: "network-only",
  });

  return data.cardPaymentMethods;
}
