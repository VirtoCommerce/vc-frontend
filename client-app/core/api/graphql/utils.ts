import { isDefined } from "@vueuse/core";
import { intersection } from "lodash";
import { apolloClient } from "@/core/api/graphql/client";

export function filterActiveQuerieNames(queryNames: string[]) {
  const activeQueryNames = Array.from(apolloClient.getObservableQueries().values())
    .filter((query) => !!query.queryName)
    .map((query) => query.queryName!);
  const t = intersection(activeQueryNames, queryNames);
  console.log(t);
  return t;
}

export function toOptimisticResponse<T extends { id?: string } | undefined>(data: T, __typename: string): T {
  if (isDefined(data)) {
    return {
      ...data,
      id: data.id ?? self.crypto.randomUUID(),
      __typename,
    };
  }
  // Because Maybe<T> is configued as T instead of T | null for GraphQL
  return null as unknown as T;
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
