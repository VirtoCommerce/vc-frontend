import { from, split, ApolloLink } from "@apollo/client/core";
import { removeTypenameFromVariables } from "@apollo/client/link/remove-typename";
import { getMainDefinition } from "@apollo/client/utilities";
import { Kind, OperationTypeNode } from "graphql";
import { cartLink } from "@/core/api/graphql/cart/links";
import { errorHandlerLink } from "@/core/api/graphql/config/error-handler";
import { httpLink } from "./http";
import { timeoutLink } from "./timeout";
import { wsLink } from "./ws";
import type { OperationDefinitionNode } from "graphql";

// Custom link to add x-operation-type header for query and mutation
const operationTypeHeaderLink = new ApolloLink((operation, forward) => {
  const definition = getMainDefinition(operation.query) as OperationDefinitionNode;
  if (definition.kind === Kind.OPERATION_DEFINITION && definition.operation === OperationTypeNode.QUERY) {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        "X-GraphQL-Operation": "readonly",
      },
    }));
  }
  return forward(operation);
});

const sharedLink = from([
  operationTypeHeaderLink, // Inject operation type header
  removeTypenameFromVariables(),
  timeoutLink,
  errorHandlerLink,
]);

// https://www.apollographql.com/docs/react/api/link/introduction/#composing-a-link-chain
// Tree:
// removeTypenameLink
// ↓
// errorHandlerLink
// ↓
// (conditional links)
// ↓
// wsLink/httpLink
export const link = from([
  sharedLink,
  // Add conditional links here
  cartLink,
  // Send only subscriptions through web sockets
  split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      // Disabled because importing this enums cause issues and graphql package will remove them at v17
      // https://virtocommerce.atlassian.net/browse/VCST-834
      // https://github.com/graphql/graphql-js/pull/3686
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      return definition.kind === "OperationDefinition" && definition.operation === "subscription";
    },
    wsLink,
    httpLink,
  ),
]);
