import { useMutation as _useMutation } from "@vue/apollo-composable";
import { merge } from "lodash";
import { toValue } from "vue";
import type { DeepOmitByType, DeepPartial } from "@/core/types/utility";
import type { OperationVariables } from "@apollo/client/core";
import type { MutateFunction, UseMutationReturn } from "@vue/apollo-composable";

// These eslint rules disabled to follow the original @vue/apollo-composable names and signatures
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */

// Workarounds as @vue/apollo-composable missed export these types
export type UseMutationParametersType<TResult, TVariables extends OperationVariables = OperationVariables> = Parameters<
  typeof _useMutation<TResult, TVariables>
>;

export type DocumentParameter<
  TResult,
  TVariables extends OperationVariables = OperationVariables,
> = UseMutationParametersType<TResult, TVariables>[0];

export type OptionsParameter<
  TResult,
  TVariables extends OperationVariables = OperationVariables,
> = UseMutationParametersType<TResult, TVariables>[1];

// Workaround for variables deep merge
export function useMutation<
  TResult = any,
  TVariables extends OperationVariables = OperationVariables,
  TGlobalVariables extends DeepPartial<TVariables> = DeepPartial<TVariables>,
  TMutateVariables extends DeepOmitByType<TVariables, TGlobalVariables> = DeepOmitByType<TVariables, TGlobalVariables>,
>(
  document: DocumentParameter<TResult, TVariables>,
  options: OptionsParameter<TResult, TGlobalVariables> = {},
): UseMutationReturn<TResult, TMutateVariables> {
  const result = _useMutation<TResult, TMutateVariables>(
    document,
    options as OptionsParameter<TResult, TMutateVariables>,
  );
  const mutate: MutateFunction<TResult, TMutateVariables> = (variables, overrideOptions) => {
    return result.mutate(merge({}, toValue(options).variables, variables), overrideOptions);
  };
  return {
    ...result,
    mutate,
  };
}
