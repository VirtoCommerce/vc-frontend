import { ApolloLink, Observable } from "@apollo/client/core";
import { getAppInsights } from "@/core/plugins/applicationInsights.plugin";
import type { FetchResult } from "@apollo/client/core";
import type { NetworkError } from "@apollo/client/errors";

export const reportTimeoutLink = new ApolloLink(
  (operation, forward) =>
    new Observable<FetchResult>((observer) => {
      forward(operation).subscribe({
        next: (result) => observer.next(result),
        error: (error: NetworkError) => {
          // `AbortSignal.timeout` makes fetch reject with a `TimeoutError`, not an `AbortError`.
          // Variables are left out on purpose: they can carry passwords and personal data.
          if (error?.name === "TimeoutError") {
            getAppInsights()?.trackException({
              exception: error,
              properties: { type: "RequestTimeout", operationName: operation.operationName },
            });
          }
          observer.error(error);
        },
        complete: () => observer.complete(),
      });

      // No teardown on purpose. A caller that stops listening (the page is left while its query is still loading)
      // doesn't cancel the request: `HttpLink` aborts on unsubscribe only with a signal of its own, and `timeoutLink`
      // always gives it one. Staying subscribed is the only way to learn that such a request timed out.
    }),
);
