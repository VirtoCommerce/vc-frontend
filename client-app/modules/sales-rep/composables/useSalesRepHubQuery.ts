import { useQuery } from "@vue/apollo-composable";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import type { OperationVariables, TypedDocumentNode } from "@apollo/client/core";
import type { UseQueryOptions, UseQueryReturn } from "@vue/apollo-composable";
import type { Ref } from "vue";

// The parameter shapes the module uses; `@vue/apollo-composable` keeps its own DocumentParameter /
// VariablesParameter internal (only the options and the return type are exported).
type HubDocumentType<TResult, TVariables> =
  TypedDocumentNode<TResult, TVariables> | Ref<TypedDocumentNode<TResult, TVariables>>;
type HubVariablesType<TVariables> = TVariables | Ref<TVariables> | (() => TVariables);

/**
 * `useQuery` for a Sales Rep hub read: it opts out of the global error toast, because every one of these
 * reads names its own failure inline — a card error, a failure view, a not-found page — and a degraded
 * widget must not read as a page-level outage (VCST-5682).
 *
 * Going through the wrapper is what makes that hold for the *next* widget too: the opt-out is a bare
 * operation context, so a call site that forgets it silently gets the toast back. `no-restricted-syntax`
 * in eslint.config.js keeps direct `useQuery` out of this folder. Mutations stay on `useMutation` — a
 * failed user action still deserves a toast.
 */
export function useSalesRepHubQuery<TResult, TVariables extends OperationVariables>(
  document: HubDocumentType<TResult, TVariables>,
  variables: HubVariablesType<TVariables>,
  options: UseQueryOptions<TResult, TVariables> = {},
): UseQueryReturn<TResult, TVariables> {
  return useQuery(document, variables, {
    ...options,
    // A caller-supplied context still wins, minus the opt-out it can't sensibly override.
    context: { ...options.context, ...SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT },
  });
}
