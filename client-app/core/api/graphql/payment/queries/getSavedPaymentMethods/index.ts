import { graphqlClient } from "@/core/api/graphql/client";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { GetSavedPaymentMethodsDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import type { GetSavedPaymentMethodsQuery } from "@/core/api/graphql/types";

/** The signed-in customer's saved cards in the current store. */
export async function getSavedPaymentMethods(
  options: { suppressErrorNotifications?: boolean } = {},
): Promise<GetSavedPaymentMethodsQuery["savedPaymentMethods"]> {
  const { data } = await graphqlClient.query({
    query: GetSavedPaymentMethodsDocument,
    variables: { storeId: globals.storeId ?? "" },
    fetchPolicy: "network-only",
    // A page that shows its own load error asks for no global toast on top of it.
    context: options.suppressErrorNotifications ? SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT : undefined,
  });

  return data.savedPaymentMethods;
}
