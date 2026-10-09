import { useQuery } from "@vue/apollo-composable";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import type { OperationVariables, TypedDocumentNode } from "@apollo/client/core";
import type { UseQueryOptions, UseQueryReturn } from "@vue/apollo-composable";
import type { Ref } from "vue";

// `@vue/apollo-composable` exports only its options and return types, so the parameter shapes live here.
type HubDocumentType<TResult, TVariables> =
  TypedDocumentNode<TResult, TVariables> | Ref<TypedDocumentNode<TResult, TVariables>>;
type HubVariablesType<TVariables> = TVariables | Ref<TVariables> | (() => TVariables);

/**
 * `useQuery` for a Sales Rep read: opts the operation out of the global error toast, since each of these reads
 * names its own failure inline (VCST-5682). `no-restricted-syntax` in eslint.config.js keeps direct `useQuery`
 * out of the module.
 */
export function useSalesRepHubQuery<TResult, TVariables extends OperationVariables>(
  document: HubDocumentType<TResult, TVariables>,
  variables: HubVariablesType<TVariables>,
  options: UseQueryOptions<TResult, TVariables> = {},
): UseQueryReturn<TResult, TVariables> {
  return useQuery(document, variables, {
    ...options,
    context: { ...options.context, ...SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT },
  });
}
