import { from, split } from "@apollo/client/core";
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { FULL_CART_MUTATION_NAMES } from "@/core/api/graphql/cart/consts";
import { apolloFetch } from "@/core/api/graphql/config/interceptors";
import { HTTP_ENDPOINT_URL } from "@/core/api/graphql/consts";
import { DEFAULT_DEBOUNCE_IN_MS } from "@/shared/cart/constants";
import type { FetchResult, NextLink, Operation, Observable } from "@apollo/client/core";
import type { BatchHandler } from "@apollo/client/link/batch";

function canSkipQuery(operation: Operation): operation is Operation & { variables: { skipQuery: boolean } } {
  return "skipQuery" in operation.variables;
}

class BatchCartLink extends BatchHttpLink {
  constructor(fetchParams?: BatchHttpLink.Options) {
    super(fetchParams);
    // Dirty hack until Apollo will make method public
    /* eslint-disable @typescript-eslint/no-explicit-any */
    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const batcher = (this as any).batcher.batcher;
    const batchHandler = batcher.batchHandler as BatchHandler;
    batcher.batchHandler = (
      operations: Operation[],
      forward?: (NextLink | undefined)[],
    ): Observable<FetchResult[]> | null => {
      // Load cart only once per batch
      operations
        .filter(canSkipQuery)
        .slice(0, -1)
        .forEach((operation) => {
          operation.variables.skipQuery = true;
        });

      return batchHandler(operations, forward);
    };
  }
}

export const batchLink = from([
  split(
    (operation) => FULL_CART_MUTATION_NAMES.includes(operation.operationName),
    new BatchCartLink({
      uri: HTTP_ENDPOINT_URL,
      batchInterval: DEFAULT_DEBOUNCE_IN_MS,
      batchDebounce: true,
      fetch: apolloFetch,
    }),
  ),
]);
