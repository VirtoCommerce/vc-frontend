import { useApolloClient } from "@vue/apollo-composable";
import { useMutation } from "@/core/api/graphql/composables";
import { OperationNames } from "@/core/api/graphql/types";
import { filterActiveQueryNames } from "@/core/api/graphql/utils";
import { CreateQuoteFromCartDocument } from "../../types";
import type { QuoteType } from "../../types";

export function useCreateQuoteFromCartMutation() {
  const { client } = useApolloClient();
  return useMutation(CreateQuoteFromCartDocument, {
    refetchQueries: () => filterActiveQueryNames(client, [OperationNames.Query.GetFullCart]),
  });
}

/** @deprecated Use {@link useCreateQuoteFromCartMutation} instead. */
export async function createQuoteFromCart(cartId: string, comment: string): Promise<QuoteType> {
  const { mutate } = useCreateQuoteFromCartMutation();

  const result = await mutate({
    command: {
      cartId,
      comment,
    },
  });
  return result!.data!.createQuoteFromCart as QuoteType;
}
