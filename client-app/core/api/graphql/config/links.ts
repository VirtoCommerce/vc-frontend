import { HttpLink, from } from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import { removeTypenameFromVariables } from "@apollo/client/link/remove-typename";
import { cartLink } from "@/core/api/graphql/cart/links";
import { errorHandlerLink } from "@/core/api/graphql/config/error-handler";
import { apolloFetch } from "@/core/api/graphql/config/interceptors";
import { API_URL } from "@/core/api/graphql/consts";
import { useAuth } from "@/core/composables";

const { refresh, isTokenValid, authHeaders } = useAuth();

const authTokenizer = setContext(async (_, { headers }) => {
  if (!isTokenValid()) {
    await refresh();
  }

  return {
    headers: {
      ...headers,
      ...authHeaders.value,
    },
  };
});

const httpLink = new HttpLink({ uri: API_URL, fetch: apolloFetch });
const sharedLink = from([removeTypenameFromVariables(), errorHandlerLink]);

export const deprecatedLink = from([sharedLink, httpLink]);

// https://www.apollographql.com/docs/react/api/link/introduction/#composing-a-link-chain
// Tree:
//         removeTypenameLink
//                  ↓
//          errorHandlerLink
//          ↓               ↓
// (conditional links) → httpLink
export const link = from([
  sharedLink,
  // Add conditional links here
  cartLink,
  httpLink,
]);
