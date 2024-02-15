import { intersection } from "lodash";
import type { ApolloClient } from "@apollo/client/core";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function filterActiveQueryNames<TCacheShape = any>(
  apolloClient: ApolloClient<TCacheShape>,
  queryNames: string[],
) {
  const activeQueryNames = Array.from(apolloClient.getObservableQueries().values())
    .filter((query) => !!query.queryName)
    .map((query) => query.queryName!);
  return intersection(activeQueryNames, queryNames);
}

export function getChildCategoriesTreeString(level: number): string {
  return level > 0
    ? `
      childCategories {
        id
        name
        slug
        ${getChildCategoriesTreeString(level - 1)}
      }
    `
    : "";
}
