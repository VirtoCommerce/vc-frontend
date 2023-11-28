import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import { cache, errorHandlerLink, httpLink, link, options } from "@/core/api/graphql/config";
import type { FetchPolicy } from "@apollo/client/core";

const fetchPolicy: FetchPolicy = "no-cache";

/**
 * Non-cached version of Apollo Client
 *
 * @deprecated
 *
 * Use {@link apolloClient} instead.
 *
 * **IMPORTANT!** Because of cache usage, query deduplication and `@vue/apollo-composable` usage,
 * you can't just replace {@link graphqlClient} with {@link apolloClient} in your code.
 * Look at TODO for more information.
 */
export const graphqlClient = new ApolloClient({
  ...options,
  link: errorHandlerLink.concat(httpLink),

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
