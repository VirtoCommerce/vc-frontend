import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import { cache, deprecatedLink, link, options } from "@/core/api/graphql/config";

const fetchPolicy = "no-cache";

/**
 * Non-cached version of Apollo Client
 *
 * @deprecated
 *
 * Use {@link apolloClient} instead.
 *
 * **IMPORTANT!** Because of cache usage, query deduplication and `@vue/apollo-composable` usage,
 * you can't just replace {@link graphqlClient} with {@link apolloClient} in your code.
 * Look at https://github.com/VirtoCommerce/vc-theme-b2b-vue/pull/868 for more information.
 */
export const graphqlClient = new ApolloClient({
  ...options,
  link: deprecatedLink,

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
