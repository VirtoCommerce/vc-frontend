import { isDefined } from "@vueuse/core";
import { intersection } from "lodash";
import { v4 as uuidv4 } from "uuid";
import { ServerError } from "@/core/api/common";
import { AbortReason } from "@/core/api/common/enums";
import { GraphQLErrorCode } from "@/core/api/graphql/enums";
import type { ApolloClient } from "@apollo/client/core";
import type { NetworkError } from "@apollo/client/errors";
import type { GraphQLFormattedError } from "graphql";

export function hasErrorCode(
  graphQLErrors: ReadonlyArray<GraphQLFormattedError> | undefined,
  errorCode: GraphQLErrorCode,
) {
  return graphQLErrors?.some((graphQLError) => graphQLError.extensions?.code === errorCode);
}

export function toServerError(
  networkError: NetworkError | undefined,
  graphQLErrors: ReadonlyArray<GraphQLFormattedError> | undefined,
): ServerError | undefined {
  const isExplicitlyAborted =
    networkError?.toString() === (AbortReason.Explicit as string) || networkError?.toString().includes("AbortError");
  if ((networkError && !isExplicitlyAborted) || hasErrorCode(graphQLErrors, GraphQLErrorCode.Unhandled)) {
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

export function generateCacheIdIfNew<T extends { id?: string } | undefined>(
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
