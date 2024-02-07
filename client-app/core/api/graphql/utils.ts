import { intersection } from "lodash";
import { apolloClient } from "@/core/api/graphql/client";

export function filterActiveQuerieNames(queryNames: string[]) {
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
