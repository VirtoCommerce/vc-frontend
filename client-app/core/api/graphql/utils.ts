import { intersection } from "lodash";
import { ServerError } from "@/core/api/common";
import { GraphQLErrorCode } from "@/core/api/graphql/enums";
import type { ApolloClient } from "@apollo/client/core";
import type { GraphQLErrors, NetworkError } from "@apollo/client/errors";
import type { GraphQLError } from "graphql";

export function hasErrorCode(graphQLErrors: ReadonlyArray<GraphQLError> | undefined, errorCode: GraphQLErrorCode) {
  return graphQLErrors?.some((graphQLError) => graphQLError.extensions.code === errorCode);
}

export function toServerError(
  networkError: NetworkError | undefined,
  graphQLErrors: GraphQLErrors | undefined,
): ServerError | undefined {
  if (networkError || hasErrorCode(graphQLErrors, GraphQLErrorCode.Unhandled)) {
    return ServerError.Unhandled;
  }

  if (hasErrorCode(graphQLErrors, GraphQLErrorCode.Unauthorized)) {
    return ServerError.Unauthorized;
  }

  if (hasErrorCode(graphQLErrors, GraphQLErrorCode.Forbidden)) {
    return ServerError.Forbidden;
  }
}

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
