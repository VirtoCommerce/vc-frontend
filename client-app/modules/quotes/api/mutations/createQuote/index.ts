import { useMutation } from "@/core/api/graphql/composables";
import { globals } from "@/core/globals";
import { CreateQuoteDocument } from "../../types";

export function useCreateQuoteMutation() {
  const { storeId, userId, currencyCode, cultureName } = globals;

  return useMutation(CreateQuoteDocument, { variables: { command: { storeId, userId, currencyCode, cultureName } } });
}
