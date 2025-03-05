//import { HttpLink } from "@apollo/client/core";
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { apolloFetch } from "@/core/api/graphql/config/interceptors";
import { HTTP_ENDPOINT_URL } from "@/core/api/graphql/consts";

//export const httpLink = new HttpLink({ uri: HTTP_ENDPOINT_URL, fetch: apolloFetch });
export const httpLink = new BatchHttpLink({
  uri: HTTP_ENDPOINT_URL,
  fetch: apolloFetch,
  batchInterval: 300,
});
