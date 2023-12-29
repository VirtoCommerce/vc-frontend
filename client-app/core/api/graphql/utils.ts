import { isDefined } from "@vueuse/core";
import type { GraphQLErrorCode } from "./enums";
import type { GraphQLError } from "graphql";

export function hasErrorCode(graphQLErrors: ReadonlyArray<GraphQLError> | undefined, errorCode: GraphQLErrorCode) {
  return graphQLErrors?.some((graphQLError) => graphQLError.extensions.code === errorCode);
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
