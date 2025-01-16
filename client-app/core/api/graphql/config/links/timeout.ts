import { ApolloLink } from "@apollo/client/core";
import { DEFAULT_REQUEST_TIMEOUT } from "@/core/api/graphql/consts";
import type { DefaultContext } from "@apollo/client/core";

export const timeoutLink = new ApolloLink((operation, forward) => {
  operation.setContext((previousContext: DefaultContext & { fetchOptions?: RequestInit }) => {
    const timeoutSignal = AbortSignal.timeout(DEFAULT_REQUEST_TIMEOUT);
    const currentSignal = previousContext.fetchOptions?.signal;
    return {
      fetchOptions: {
        signal: currentSignal ? AbortSignal.any([timeoutSignal, currentSignal]) : timeoutSignal,
      },
    };
  });
  return forward(operation);
});
