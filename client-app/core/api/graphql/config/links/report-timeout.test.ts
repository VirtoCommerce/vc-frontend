// @vitest-environment node
import { ApolloLink, Observable, execute, gql } from "@apollo/client/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { reportTimeoutLink } from "./report-timeout";
import type { FetchResult, Observer } from "@apollo/client/core";

const trackException = vi.hoisted(() => vi.fn());

vi.mock("@/core/plugins/applicationInsights.plugin", () => ({
  getAppInsights: () => ({ trackException }),
}));

const QUERY = gql`
  query TestQuery {
    test {
      id
    }
  }
`;

const timeoutError = new DOMException("signal timed out", "TimeoutError");

/** Starts one operation: `request` is the side `HttpLink` settles, `subscription` and `onError` are the caller's. */
function start() {
  let request!: Observer<FetchResult>;
  const terminatingLink = new ApolloLink(
    () =>
      new Observable((observer) => {
        request = observer;
      }),
  );
  const onError = vi.fn();
  const subscription = execute(ApolloLink.from([reportTimeoutLink, terminatingLink]), { query: QUERY }).subscribe({
    error: onError,
  });

  return { request, subscription, onError };
}

beforeEach(() => {
  trackException.mockClear();
});

describe("reportTimeoutLink", () => {
  it("reports a timed-out request to Application Insights and passes the error on to the caller", () => {
    const { request, onError } = start();

    request.error?.(timeoutError);

    expect(trackException.mock.calls).toEqual([
      [{ exception: timeoutError, properties: { type: "RequestTimeout", operationName: "TestQuery" } }],
    ]);
    expect(onError).toHaveBeenCalledWith(timeoutError);
  });

  it("reports a timed-out request whose caller has stopped listening", () => {
    const { request, subscription } = start();

    subscription.unsubscribe();
    request.error?.(timeoutError);

    expect(trackException).toHaveBeenCalledTimes(1);
  });

  it("does not report an abandoned request that was answered, aborted or failed for another reason", () => {
    const answered = start();
    answered.subscription.unsubscribe();
    answered.request.next?.({ data: { test: null } });
    answered.request.complete?.();

    const aborted = start();
    aborted.subscription.unsubscribe();
    aborted.request.error?.(new DOMException("This operation was aborted", "AbortError"));

    const failed = start();
    failed.request.error?.(new Error("Failed to fetch"));

    expect(trackException).not.toHaveBeenCalled();
  });
});
