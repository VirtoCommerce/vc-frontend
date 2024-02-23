import { isDefined } from "@vueuse/core";
import { intersection } from "lodash";
import { v4 as uuidv4 } from "uuid";
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

export function toOptimisticResponse<T extends { id?: string } | undefined>(
  data: T,
  __typename: string,
): T | undefined {
  if (isDefined(data)) {
    return {
      ...data,
      id: data.id ?? uuidv4(),
      __typename,
    };
  }
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
