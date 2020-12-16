import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { baseUrl } from '@core/constants';
const fetchPolicy = 'no-cache';

const graphqlClient = new ApolloClient({
  // Provide required constructor fields
  link: new HttpLink({ uri: `${baseUrl}/xapi/graphql` }),
  cache: new InMemoryCache({
    freezeResults: true
  }),

  // Provide some optional constructor fields
  name: 'x-api-graphql-client',
  connectToDevTools: true,
  assumeImmutableResults: true,
  // queryDeduplication: false,

  defaultOptions: {
    watchQuery: { fetchPolicy },
    query: { fetchPolicy }
    // mutate: { fetchPolicy },
  }
});

export default graphqlClient;
