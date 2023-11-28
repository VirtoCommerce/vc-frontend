import { computed, toValue, unref } from "vue";
import { useAllGlobalVariables } from "@/core/api/graphql/composables";
import type { IAllGlobalVariables, OptionsParameter } from "@/core/api/graphql/composables";
import type { CartIdFragment } from "@/core/api/graphql/types";
import type { UseMutationOptions } from "@vue/apollo-composable";
import type { MaybeRef, Ref } from "vue";

export interface ICartVariables extends IAllGlobalVariables {
  cartId?: string;
}

export interface ICartMutationVariables {
  command: ICartVariables;
  skipQuery: boolean;
}

export type CartMutationOptionsType<TResult> = Omit<OptionsParameter<TResult, ICartMutationVariables>, "variables">;

export function useCartMutationVariables<TResult>(
  cart?: MaybeRef<CartIdFragment | undefined>,
  options: CartMutationOptionsType<TResult> = {},
): Ref<UseMutationOptions<TResult, ICartMutationVariables>> {
  return computed(() => ({
    variables: {
      command: {
        ...useAllGlobalVariables(),
        cartId: unref(cart)?.id,
      },
      skipQuery: false,
    },
    ...toValue(options),
  }));
}
