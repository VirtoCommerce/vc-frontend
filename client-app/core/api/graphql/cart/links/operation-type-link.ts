import { ApolloLink } from "@apollo/client/core";
import { getMainDefinition } from "@apollo/client/utilities";

export const operationTypeLink = new ApolloLink((operation, forward) => {
  const definition = getMainDefinition(operation.query);

  if (definition.kind === "OperationDefinition") {
    let operationType: string;

    switch (definition.operation) {
      case "query":
        operationType = "query";
        break;
      case "mutation":
        operationType = "mutation";
        break;
      case "subscription":
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
