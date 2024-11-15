import { useMutation as _useMutation } from "@vue/apollo-composable";
import { merge } from "lodash";
import { toValue } from "vue";
import type { DeepOmitByType } from "@/core/types/utility";
import type { DocumentNode, OperationVariables, TypedDocumentNode } from "@apollo/client/core";
import type { MutateFunction, UseMutationOptions, UseMutationReturn } from "@vue/apollo-composable";
import type { DeepPartial } from "utility-types";
import type { MaybeRefOrGetter } from "vue";

// Workaround for variables deep merge
export function useMutation<
  // Follow the original @vue/apollo-composable names and signatures
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TResult = any,
  TVariables extends OperationVariables = OperationVariables,
  TGlobalVariables extends DeepPartial<TVariables> = DeepPartial<TVariables>,
  TLocalVariables extends DeepOmitByType<TVariables, TGlobalVariables> = DeepOmitByType<TVariables, TGlobalVariables>,
>(
  document: MaybeRefOrGetter<DocumentNode | TypedDocumentNode<TResult, TVariables>>,
  options: MaybeRefOrGetter<UseMutationOptions<TResult, TGlobalVariables>> = {},
): Omit<UseMutationReturn<TResult, TVariables>, "mutate"> & { mutate: MutateFunction<TResult, TLocalVariables> } {
  const result = _useMutation<TResult, TVariables>(
    document,
    options as MaybeRefOrGetter<UseMutationOptions<TResult, TVariables>>,
  );
  const mutate: MutateFunction<TResult, TLocalVariables> = (variables, overrideOptions) => {
    return result.mutate(merge({}, toValue(options).variables, variables) as TVariables, overrideOptions);
  };
  return {
    ...result,
    mutate,
  };
}
