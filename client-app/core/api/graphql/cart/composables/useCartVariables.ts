import { computed, toValue, unref } from "vue";
import { useAllGlobalVariables } from "@/core/api/graphql/composables";
import type { IAllGlobalVariables } from "@/core/api/graphql/composables";
import type { CartIdFragment } from "@/core/api/graphql/types";
import type { UseMutationOptions } from "@vue/apollo-composable";
import type { MaybeRef, MaybeRefOrGetter, Ref } from "vue";

export interface ICartVariables extends IAllGlobalVariables {
  cartId?: string;
}

export interface ICartSkippableQueryVariables {
  skipQuery: boolean;
}

export interface ICartQueryVariables extends ICartVariables, ICartSkippableQueryVariables {}

export interface ICartMutationVariables extends ICartSkippableQueryVariables {
  command: ICartVariables;
}

export type CartMutationOptionsType<TResult> = Omit<UseMutationOptions<TResult, ICartMutationVariables>, "variables">;

export function useCartQueryVariables(): Ref<ICartQueryVariables> {
  return computed(() => ({
    ...unref(useAllGlobalVariables()),
    skipQuery: false,
  }));
}

export function useCartMutationVariables<TResult>(
  cart?: MaybeRef<CartIdFragment | undefined>,
  options: MaybeRefOrGetter<CartMutationOptionsType<TResult>> = {},
): Ref<UseMutationOptions<TResult, ICartMutationVariables>> {
  return computed(() => ({
    variables: {
      command: {
        ...unref(useAllGlobalVariables()),
        cartId: unref(cart)?.id,
      },
      skipQuery: false,
    },
    ...toValue(options),
  }));
}
