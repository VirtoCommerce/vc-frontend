import { useApolloClient } from "@vue/apollo-composable";
import { useMutation } from "@/core/api/graphql/composables";
import { CreateQuoteFromCartDocument, OperationNames } from "@/core/api/graphql/types";
import { filterActiveQueryNames } from "@/core/api/graphql/utils";
import type { QuoteType } from "@/core/api/graphql/types";

export function useCreateQuoteFromCartMutation() {
  const { client } = useApolloClient();
  const result = useMutation(CreateQuoteFromCartDocument, {
    refetchQueries: () => filterActiveQueryNames(client, [OperationNames.Query.GetFullCart]),
    awaitRefetchQueries: true,
  });
  result.onDone(() => client.cache.gc());
  return result;
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
