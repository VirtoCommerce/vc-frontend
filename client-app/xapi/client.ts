import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient, FetchPolicy } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";

const fetchPolicy: FetchPolicy = "no-cache";

const httpLink = new HttpLink({ uri: `/xapi/graphql` });

const errorHandler = onError(({ graphQLErrors = [] }) => {
  for (let l = graphQLErrors.length, i = 0; i < l; i += 1) {
    const {
      extensions: { code },
    } = graphQLErrors[i];

    if (code === "Unauthorized") {
      const { hash, pathname, search } = location;
      location.href = `/sign-in?redirect=${pathname + search + hash}`;
      return;
    }

    if (code === "Forbidden") {
      // TODO: Use notification
      alert("User doesn't have the required permission.");
    }
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
