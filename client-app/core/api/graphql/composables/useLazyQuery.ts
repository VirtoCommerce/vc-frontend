import { useLazyQuery as _useLazyQuery } from "@vue/apollo-composable";
import { merge } from "lodash";
import { toValue } from "vue";
import type { DeepOmitByType } from "@/core/types/utility";
import type { ApolloQueryResult, DocumentNode, OperationVariables, TypedDocumentNode } from "@apollo/client/core";
import type { UseQueryOptions } from "@vue/apollo-composable";
import type { UseLazyQueryReturn } from "@vue/apollo-composable/dist/useLazyQuery";
import type { DeepPartial } from "utility-types";
import type { MaybeRefOrGetter } from "vue";

// Workaround for variables deep merge
export function useLazyQuery<
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
): Omit<UseLazyQueryReturn<TResult, TVariables>, "load" | "refetch"> & {
  load: (
    document?: DocumentNode | null,
    variables?: TLocalVariables | null,
    options?: UseQueryOptions | null,
  ) => false | Promise<TResult>;
  refetch: (variables?: TLocalVariables) => Promise<ApolloQueryResult<TResult>> | undefined;
} {
  const result = _useLazyQuery<TResult, TVariables>(
    document,
    globalVariables as MaybeRefOrGetter<TVariables>,
    options as MaybeRefOrGetter<UseQueryOptions<TResult, TVariables>>,
  );
  const refetch = (localVariables?: TLocalVariables): Promise<ApolloQueryResult<TResult>> | undefined => {
    return result.refetch(merge({}, toValue(globalVariables), localVariables) as TVariables);
  };
  const load = (
    overrideDocument?: DocumentNode | null,
    localVariables?: TLocalVariables | null,
    overrideOptions?: UseQueryOptions | null,
  ): false | Promise<TResult> => {
    return result.load(
      overrideDocument,
      merge({}, toValue(globalVariables), localVariables) as TVariables,
      overrideOptions,
    );
  };
  return {
    ...result,
    load,
    refetch,
  };
}
