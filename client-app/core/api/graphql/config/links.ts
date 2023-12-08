import { HttpLink, from } from "@apollo/client/core";
import { removeTypenameFromVariables } from "@apollo/client/link/remove-typename";
import { cartLink } from "@/core/api/graphql/cart/links";
import { errorHandlerLink } from "@/core/api/graphql/config/error-handler";
import { API_URL } from "@/core/api/graphql/consts";

export const httpLink = new HttpLink({ uri: API_URL });

// https://www.apollographql.com/docs/react/api/link/introduction/#composing-a-link-chain
// Tree:
//         removeTypenameLink
//                  ↓
//          errorHandlerLink
//          ↓               ↓
// (conditional links) → httpLink
export const link = from([
  removeTypenameFromVariables(),
  errorHandlerLink,
  // Add conditional links here
  cartLink,
  httpLink,
]);
