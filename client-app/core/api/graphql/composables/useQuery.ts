import { useQuery as _useQuery } from "@vue/apollo-composable";
import { merge } from "lodash";
import { toValue } from "vue";
import type { DeepOmitByType } from "@/core/types/utility";
import type { ApolloQueryResult, DocumentNode, OperationVariables, TypedDocumentNode } from "@apollo/client/core";
import type { UseQueryOptions, UseQueryReturn } from "@vue/apollo-composable";
import type { DeepPartial } from "utility-types";
import type { MaybeRefOrGetter } from "vue";

// Workaround for variables deep merge
export function useQuery<
  // Follow the original @vue/apollo-composable names and signatures
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TResult = any,
  TVariables extends OperationVariables = OperationVariables,
  TGlobalVariables extends DeepPartial<TVariables> = DeepPartial<TVariables>,
  TLocalVariables extends DeepOmitByType<TVariables, TGlobalVariables> = DeepOmitByType<TVariables, TGlobalVariables>,
>(
  document: MaybeRefOrGetter<DocumentNode | TypedDocumentNode<TResult, TVariables>>,
  globalVariables?: MaybeRefOrGetter<TGlobalVariables>,
  options: MaybeRefOrGetter<UseQueryOptions<TResult, TGlobalVariables>> = {},
): Omit<UseQueryReturn<TResult, TVariables>, "refetch"> & {
  refetch: (variables?: TLocalVariables) => Promise<ApolloQueryResult<TResult>> | undefined;
} {
  const result = _useQuery<TResult, TVariables>(
    document,
    globalVariables as MaybeRefOrGetter<TVariables>,
    options as MaybeRefOrGetter<UseQueryOptions<TResult, TVariables>>,
  );
  const refetch = (localVariables?: TLocalVariables): Promise<ApolloQueryResult<TResult>> | undefined => {
    return result.refetch(merge({}, toValue(globalVariables), localVariables) as TVariables);
  };
  return {
    ...result,
    refetch,
  };
}
