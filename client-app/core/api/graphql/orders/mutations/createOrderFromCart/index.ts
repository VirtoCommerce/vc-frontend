import { useApolloClient } from "@vue/apollo-composable";
import { useMutation } from "@/core/api/graphql/composables";
import { CreateOrderFromCartDocument, OperationNames } from "@/core/api/graphql/types";
import { filterActiveQueryNames } from "@/core/api/graphql/utils";
import type { CustomerOrderType } from "@/core/api/graphql/types";

export function useCreateOrderFromCartMutation() {
  const { client } = useApolloClient();
  const result = useMutation(CreateOrderFromCartDocument, {
    refetchQueries: () => filterActiveQueryNames(client, [OperationNames.Query.GetFullCart]),
    awaitRefetchQueries: true,
  });
  result.onDone(() => client.cache.gc());
  return result;
}

/** @deprecated Use {@link useCreateOrderFromCartMutation} instead. */
export async function createOrderFromCart(cartId?: string): Promise<CustomerOrderType> {
  const { mutate } = useCreateOrderFromCartMutation();

  const result = await mutate({
    command: {
      cartId,
    },
  });
  return result!.data!.createOrderFromCart as CustomerOrderType;
}
