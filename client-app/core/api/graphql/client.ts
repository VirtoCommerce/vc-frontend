import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { onError } from "apollo-link-error";
import { HttpLink } from "apollo-link-http";
import fetch from "isomorphic-fetch";
import { TabsType, unauthorizedErrorEvent, unhandledErrorEvent, useBroadcast } from "@/shared/broadcast";
import type { FetchPolicy } from "apollo-client";
import type { GraphQLError } from "graphql";

const fetchPolicy: FetchPolicy = "no-cache";

const httpLink = new HttpLink({ uri: `/xapi/graphql`, fetch });

const broadcast = useBroadcast();

function hasErrorCode(graphQLErrors: ReadonlyArray<GraphQLError> | undefined, errorCode: string) {
  return graphQLErrors?.some((graphQLError) => graphQLError.extensions.code === errorCode);
}

const errorHandler = onError(({ networkError, graphQLErrors }) => {
  const unauthorized = hasErrorCode(graphQLErrors, "Unauthorized");
  const forbidden = hasErrorCode(graphQLErrors, "Forbidden");
  const unhandledError = hasErrorCode(graphQLErrors, "");

  if (networkError || unhandledError) {
    broadcast.emit(unhandledErrorEvent, undefined, TabsType.ALL);
  }

  if (unauthorized) {
    broadcast.emit(unauthorizedErrorEvent, undefined, TabsType.ALL);
  }

  if (forbidden) {
    // TODO: Use notification
    alert("User doesn't have the required permission.");
  }
});

export const graphqlClient = new ApolloClient({
  // Provide required constructor fields
  link: errorHandler.concat(httpLink),
  cache: new InMemoryCache({
    freezeResults: true,
    addTypename: false,
  }),

  // Provide some optional constructor fields
  name: "x-api-graphql-client",
  connectToDevTools: true,
  assumeImmutableResults: true,
  queryDeduplication: false,

  defaultOptions: {
    watchQuery: { fetchPolicy },
    query: { fetchPolicy },
    mutate: { fetchPolicy },
  },
});
