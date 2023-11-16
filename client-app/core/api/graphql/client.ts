import { InMemoryCache, ApolloClient, HttpLink } from "@apollo/client/core";
import { onError } from "@apollo/client/link/error";
import {
  TabsType,
  forbiddenEvent,
  unauthorizedErrorEvent,
  unhandledErrorEvent,
  userLockedEvent,
  passwordExpiredEvent,
  useBroadcast,
} from "@/shared/broadcast";
import { GraphQLErrorCode } from "./enums";
import { hasErrorCode } from "./utils";
import type { FetchPolicy } from "@apollo/client/core";

const fetchPolicy: FetchPolicy = "no-cache";

const httpLink = new HttpLink({ uri: `/xapi/graphql` });

const broadcast = useBroadcast();

const errorHandler = onError(({ networkError, graphQLErrors }) => {
  const unauthorized = hasErrorCode(graphQLErrors, GraphQLErrorCode.Unauthorized);
  const forbidden = hasErrorCode(graphQLErrors, GraphQLErrorCode.Forbidden);
  const unhandledError = hasErrorCode(graphQLErrors, GraphQLErrorCode.Unhandled);
  const userLockedError = hasErrorCode(graphQLErrors, GraphQLErrorCode.UserLocked);
  const passwordExpired = hasErrorCode(graphQLErrors, GraphQLErrorCode.PasswordExpired);

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
    broadcast.emit(forbiddenEvent, undefined, TabsType.CURRENT);
  }

  if (passwordExpired) {
    broadcast.emit(passwordExpiredEvent, undefined, TabsType.CURRENT);
  }
});

export const graphqlClient = new ApolloClient({
  // Provide required constructor fields
  link: errorHandler.concat(httpLink),
  cache: new InMemoryCache({
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
