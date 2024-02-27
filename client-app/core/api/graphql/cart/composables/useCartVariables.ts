import { toValue } from "vue";
import { useAllGlobalVariables } from "@/core/api/graphql/composables";
import type { CartIdFragment } from "@/core/api/graphql/cart/fragments/cartId.generated";
import type { IAllGlobalVariables } from "@/core/api/graphql/composables";
import type { UseMutationOptions } from "@vue/apollo-composable";
import type { MaybeRefOrGetter } from "vue";

export interface ICartVariables extends IAllGlobalVariables {
  cartId?: string;
}

export interface ICartQueryVariables extends ICartVariables {}

export interface ICartMutationVariables {
  command: ICartVariables;
  skipQuery: boolean;
}

export type CartMutationOptionsType<TResult> = Omit<UseMutationOptions<TResult, ICartMutationVariables>, "variables">;

export function useCartQueryVariables(): MaybeRefOrGetter<ICartQueryVariables> {
  return useAllGlobalVariables();
}

export function useCartMutationVariables<TResult>(
  cart?: MaybeRefOrGetter<CartIdFragment | undefined>,
  options: MaybeRefOrGetter<CartMutationOptionsType<TResult>> = {},
): UseMutationOptions<TResult, ICartMutationVariables> {
  return {
    variables: {
      command: {
        ...toValue(useAllGlobalVariables()),
        cartId: toValue(cart)?.id,
      },
      skipQuery: false,
    },
    ...toValue(options),
  };
}
