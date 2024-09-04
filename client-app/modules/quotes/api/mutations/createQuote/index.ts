import { useMutation } from "@/core/api/graphql/composables";
import { CreateQuoteDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";

export function useCreateQuoteMutation() {
  const { storeId, userId, currencyCode, cultureName } = globals;

  return useMutation(CreateQuoteDocument, { variables: { command: { storeId, userId, currencyCode, cultureName } } });
}
