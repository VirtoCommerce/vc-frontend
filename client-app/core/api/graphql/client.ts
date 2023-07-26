import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { onError } from "apollo-link-error";
import { HttpLink } from "apollo-link-http";
import fetch from "isomorphic-fetch";
import { DEFAULT_NOTIFICATION_DURATION } from "@/core/constants";
import { globals } from "@/core/globals";
import { TabsType, unauthorizedErrorEvent, useBroadcast } from "@/shared/broadcast";
import { useNotifications } from "@/shared/notification";
import type { FetchPolicy } from "apollo-client";
import type { GraphQLError } from "graphql";

const fetchPolicy: FetchPolicy = "no-cache";

const httpLink = new HttpLink({ uri: `/xapi/graphql`, fetch });

const broadcast = useBroadcast();
const notifications = useNotifications();

function hasErrorCode(graphQLErrors: ReadonlyArray<GraphQLError> | undefined, errorCode: string) {
  return graphQLErrors?.some((graphQLError) => graphQLError.extensions.code === errorCode);
}

const errorHandler = onError(({ networkError, graphQLErrors }) => {
  const { t } = globals.i18n.global;

  const unauthorized = hasErrorCode(graphQLErrors, "Unauthorized");
  const forbidden = hasErrorCode(graphQLErrors, "Forbidden");
  const unhandledError = hasErrorCode(graphQLErrors, "");

  if (networkError || unhandledError) {
    notifications.error({
      duration: DEFAULT_NOTIFICATION_DURATION,
      group: "UnhandledError",
      singleInGroup: true,
      text: t("common.messages.unhandled_error"),
    });
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
