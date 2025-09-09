import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import { cache, link, options } from "@/core/api/graphql/config";

const fetchPolicy = "no-cache";

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
    watchQuery: { fetchPolicy },
    query: { fetchPolicy },
    mutate: { fetchPolicy },
  },
});

/**
 * Default (cached) version of Apollo Client
 */
export const apolloClient = new ApolloClient({
  ...options,
  link,
  cache,
});
