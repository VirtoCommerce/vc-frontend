import { ApolloClient } from "@apollo/client/core";
import { cache, link, options } from "@/core/api/graphql/config";

/**
 * Default version of Apollo Client
 */
const apolloClient = new ApolloClient({
  ...options,
  link,
  cache,
});

export { apolloClient as graphqlClient, apolloClient };
