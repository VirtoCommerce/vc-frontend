import { ApolloLink, Observable, execute, gql } from "@apollo/client/core";
import { describe, expect, it } from "vitest";
import { timeoutLink } from "./timeout";
import type { DefaultContext } from "@apollo/client/core";

const QUERY = gql`
  query TestQuery {
    test {
      id
    }
  }
`;

function runWithContext(context: DefaultContext): Promise<DefaultContext> {
  return new Promise((resolve) => {
    const terminatingLink = new ApolloLink((operation) => {
      resolve(operation.getContext());
      return Observable.of({ data: {} });
    });

    execute(ApolloLink.from([timeoutLink, terminatingLink]), { query: QUERY, context }).subscribe({});
  });
}

describe("timeoutLink", () => {
  it("adds a timeout signal to a request that has none", async () => {
    const context = await runWithContext({});

    expect((context.fetchOptions as RequestInit).signal).toBeInstanceOf(AbortSignal);
  });

  it("keeps the caller's signal working next to the timeout", async () => {
    const controller = new AbortController();

    const context = await runWithContext({ fetchOptions: { signal: controller.signal } });
    const { signal } = context.fetchOptions as RequestInit;

    // Not the caller's own signal: that one would never time out.
    expect(signal).not.toBe(controller.signal);
    expect(signal?.aborted).toBe(false);

    controller.abort();

    expect(signal?.aborted).toBe(true);
  });

  it("keeps the caller's other fetch options", async () => {
    const context = await runWithContext({ fetchOptions: { keepalive: true } });

    expect(context.fetchOptions).toMatchObject({ keepalive: true });
    expect((context.fetchOptions as RequestInit).signal).toBeInstanceOf(AbortSignal);
  });
});
