import { useApolloClient } from "@vue/apollo-composable";
import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { OperationNames } from "@/core/api/graphql/types/operations.generated";
import { filterActiveQueryNames } from "@/core/api/graphql/utils";
import { ChangeShortCartItemQuantityDocument } from "./changeShortCartItemQuantityMutation.generated";
import type { CartIdFragment } from "@/core/api/graphql/cart/fragments/cartId.generated";
import type { MaybeRef } from "vue";

export function useChangeShortCartItemQuantityMutation(cart?: MaybeRef<CartIdFragment | undefined>) {
  const { client } = useApolloClient();
  return useMutation(
    ChangeShortCartItemQuantityDocument,
    useCartMutationVariables(cart, {
      refetchQueries: () => filterActiveQueryNames(client, [OperationNames.Query.GetFullCart]),
    }),
  );
}
