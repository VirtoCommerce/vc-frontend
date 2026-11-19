import { graphqlClient } from "@/core/api/graphql/client";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { globals } from "@/core/globals";
import { GetCardPaymentMethodsDocument } from "../../types";
import type { GetCardPaymentMethodsQuery } from "../../types";

/** The store's payment methods that can save cards, with the public parameters their card forms need. */
export async function getCardPaymentMethods(
  options: { suppressErrorNotifications?: boolean } = {},
): Promise<GetCardPaymentMethodsQuery["cardPaymentMethods"]> {
  const { data } = await graphqlClient.query({
    query: GetCardPaymentMethodsDocument,
    variables: { storeId: globals.storeId ?? "" },
    fetchPolicy: "network-only",
    // A page that shows its own load error asks for no global toast on top of it.
    context: options.suppressErrorNotifications ? SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT : undefined,
  });

  return data.cardPaymentMethods;
}
