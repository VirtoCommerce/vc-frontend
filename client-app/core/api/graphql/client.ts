import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import { cache, link, options } from "@/core/api/graphql/config";

/**
 * Non-cached version of Apollo Client
 */
export const graphqlClient = new ApolloClient({
  ...options,
  link,

  cache: new InMemoryCache({
    addTypename: false,
  }),

  queryDeduplication: false,

  defaultOptions: {
    watchQuery: { fetchPolicy: "no-cache" },
    query: { fetchPolicy: "no-cache" },
    mutate: { fetchPolicy: "no-cache" },
  },
});

/**
 * Apollo Client with cache support
 */
export const apolloClient = new ApolloClient({
  ...options,
  link,
  cache,
});
