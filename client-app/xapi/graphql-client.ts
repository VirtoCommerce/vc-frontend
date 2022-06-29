import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient, FetchPolicy } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import _ from "lodash";

const fetchPolicy: FetchPolicy = "no-cache";

const httpLink = new HttpLink({ uri: `/xapi/graphql` });

const errorHandler = onError(({ graphQLErrors }) => {
  if (graphQLErrors && graphQLErrors.length) {
    const unauthorizedError = _.find(graphQLErrors, (x) => x.extensions?.code === "Unauthorized");
    if (unauthorizedError) {
      const { hash, pathname, search } = location;
      location.href = `/sign-in?redirect=${pathname + search + hash}`;
    }
  }
});

const graphqlClient = new ApolloClient({
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

export default graphqlClient;
