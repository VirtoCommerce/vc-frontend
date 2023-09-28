import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { onError } from "apollo-link-error";
import { HttpLink } from "apollo-link-http";
import {
  TabsType,
  unauthorizedErrorEvent,
  unhandledErrorEvent,
  userLockedEvent,
  useBroadcast,
} from "@/shared/broadcast";
import { GraphQLErrorCode } from "./enums";
import { hasErrorCode } from "./utils";
import type { FetchPolicy } from "apollo-client";

const fetchPolicy: FetchPolicy = "no-cache";

const httpLink = new HttpLink({ uri: `/xapi/graphql` });

const broadcast = useBroadcast();

const errorHandler = onError(({ networkError, graphQLErrors }) => {
  const unauthorized = hasErrorCode(graphQLErrors, GraphQLErrorCode.Unauthorized);
  const forbidden = hasErrorCode(graphQLErrors, GraphQLErrorCode.Forbidden);
  const unhandledError = hasErrorCode(graphQLErrors, GraphQLErrorCode.Unhandled);
  const userLockedError = hasErrorCode(graphQLErrors, GraphQLErrorCode.UserLocked);

  if (networkError || unhandledError) {
    broadcast.emit(unhandledErrorEvent, undefined, TabsType.ALL);
  }

  if (unauthorized) {
    broadcast.emit(unauthorizedErrorEvent, undefined, TabsType.ALL);
  }

  if (userLockedError) {
    broadcast.emit(userLockedEvent, undefined, TabsType.ALL);
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
