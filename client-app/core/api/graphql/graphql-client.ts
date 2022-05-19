import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
const fetchPolicy = "no-cache";

const httpLink = new HttpLink({ uri: `/xapi/graphql` });

const errorHandler = onError(({ networkError, response }) => {
  if (networkError) {
    // if (networkError.statusCode === 401) location.href = '/auth/login'
    // if (networkError.statusCode === 403 && networkError.result.message === 'ACCOUNT_SUSPENDED' ) location.href = '/suspended'
    console.log(response);
    console.log(networkError);
  }
});

const graphqlClient = new ApolloClient({
  // Provide required constructor fields
  link: httpLink,
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
    // mutate: { fetchPolicy },
  },
});

export default graphqlClient;
