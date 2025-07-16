import { ApolloLink } from "@apollo/client/core";
import { getMainDefinition } from "@apollo/client/utilities";

export const operationTypeLink = new ApolloLink((operation, forward) => {
  const definition = getMainDefinition(operation.query);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  if (definition.kind === "OperationDefinition") {
    let operationType: string;

    switch (definition.operation) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      case "query":
        operationType = "query";
        break;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      case "mutation":
        operationType = "mutation";
        break;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
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
