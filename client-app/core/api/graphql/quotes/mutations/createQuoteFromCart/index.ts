import { useMutation } from "@/core/api/graphql/composables";
import { CreateQuoteFromCartDocument, OperationNames } from "@/core/api/graphql/types";
import { filterActiveQuerieNames } from "@/core/api/graphql/utils";
import type { QuoteType } from "@/core/api/graphql/types";

export function useCreateQuoteFromCartMutation() {
  return useMutation(CreateQuoteFromCartDocument, {
    refetchQueries: () => filterActiveQuerieNames([OperationNames.Query.GetFullCart]),
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
