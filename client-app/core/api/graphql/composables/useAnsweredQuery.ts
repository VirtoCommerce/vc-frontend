import { computed, unref } from "vue";
import type { OperationVariables } from "@apollo/client/core";
import type { UseQueryReturn } from "@vue/apollo-composable";
import type { ComputedRef } from "vue";

type AnsweredQuerySourceType<TResult, TVariables extends OperationVariables> = Pick<
  UseQueryReturn<TResult, TVariables>,
  "query" | "loading" | "variables" | "options"
>;

/**
 * The search query a `useQuery` result answers, for VcSelect's `answered-query` with `server-filter`.
 * It moves to new variables only once their result is in, and at once for a query skipped with
 * `enabled: false`. A failed query counts as answered, so clear the items on error.
 * @param queryReturn - What `useQuery` returned.
 * @param getQuery - Picks the search text out of the variables.
 */
export function useAnsweredQuery<TResult, TVariables extends OperationVariables>(
  queryReturn: AnsweredQuerySourceType<TResult, TVariables>,
  getQuery: (variables: TVariables | undefined) => string | undefined,
): ComputedRef<string | undefined> {
  const { query, loading, variables, options } = queryReturn;

  // `loading ? previous : variables` would claim new variables before `loading` rises for them.
  return computed((previous) => {
    if (unref(options).enabled === false) {
      return getQuery(variables.value);
    }

    return loading.value || !query.value ? previous : getQuery(query.value.variables);
  });
}
