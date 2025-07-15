import { ApolloLink } from "@apollo/client/core";
import { getMainDefinition } from "@apollo/client/utilities";
import { Kind, OperationTypeNode } from "graphql";
import type { OperationDefinitionNode } from "graphql";

export const operationTypeLink = new ApolloLink((operation, forward) => {
  const definition = getMainDefinition(operation.query) as OperationDefinitionNode;

  if (definition.kind === Kind.OPERATION_DEFINITION) {
    let operationType: string;

    switch (definition.operation) {
      case OperationTypeNode.QUERY:
        operationType = "query";
        break;
      case OperationTypeNode.MUTATION:
        operationType = "mutation";
        break;
      case OperationTypeNode.SUBSCRIPTION:
        operationType = "subscription";
        break;
    }

    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        "X-GraphQL-Operation-Type": operationType,
      },
    }));
  }

  return forward(operation);
});
