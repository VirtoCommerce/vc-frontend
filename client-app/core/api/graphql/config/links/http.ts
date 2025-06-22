import { HttpLink } from "@apollo/client/core";
import { apolloFetch } from "@/core/api/graphql/config/interceptors";
import { HTTP_ENDPOINT_URL, GQL_QUERY_ENDPOINT_URL, GQL_MUTATION_ENDPOINT_URL } from "@/core/api/graphql/consts";
import { IS_DEVELOPMENT } from "@/core/constants/environment";

export const httpLink = new HttpLink({ uri: HTTP_ENDPOINT_URL, fetch: apolloFetch });

export const queryHttpLink = new HttpLink({
  uri: IS_DEVELOPMENT ? HTTP_ENDPOINT_URL : GQL_QUERY_ENDPOINT_URL,
  fetch: apolloFetch,
});
export const mutationHttpLink = new HttpLink({
  uri: IS_DEVELOPMENT ? HTTP_ENDPOINT_URL : GQL_MUTATION_ENDPOINT_URL,
  fetch: apolloFetch,
});
