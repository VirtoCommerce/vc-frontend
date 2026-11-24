import { ApolloLink, Observable, execute, gql } from "@apollo/client/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { unhandledErrorEvent } from "@/shared/broadcast";
import { link } from "./index";

const emit = vi.hoisted(() => vi.fn());
const trackException = vi.hoisted(() => vi.fn());
const closeWebSocketSubscription = vi.hoisted(() => vi.fn());

vi.mock("@/shared/broadcast", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/broadcast")>();
  return { ...actual, useBroadcast: () => ({ ...actual.useBroadcast(), emit }) };
});

vi.mock("@/core/plugins/applicationInsights.plugin", () => ({
  getAppInsights: () => ({ trackException }),
}));

vi.mock("./ws", () => ({
  wsLink: new ApolloLink(() => new Observable(() => closeWebSocketSubscription)),
}));

const QUERY = gql`
  query TestQuery {
    test {
      id
    }
  }
`;

const SUBSCRIPTION = gql`
  subscription TestSubscription {
    test {
      id
    }
  }
`;

beforeEach(() => {
  emit.mockClear();
  trackException.mockClear();
  closeWebSocketSubscription.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// `reportTimeoutLink` keeps listening to a request after its caller is gone, so its place in the chain decides what else
// keeps running for that request.
describe("link", () => {
  it("reports the timeout of an abandoned query without an error toast", async () => {
    let rejectFetch!: (reason: Error) => void;
    vi.stubGlobal(
      "fetch",
      () =>
        new Promise<Response>((_resolve, reject) => {
          rejectFetch = reject;
        }),
    );

    const subscription = execute(link, { query: QUERY }).subscribe({});
    await vi.waitFor(() => expect(rejectFetch).toBeDefined());
    subscription.unsubscribe();
    rejectFetch(new DOMException("signal timed out", "TimeoutError"));

    await vi.waitFor(() => expect(trackException).toHaveBeenCalledTimes(1));
    expect(emit).not.toHaveBeenCalledWith(unhandledErrorEvent, expect.anything(), expect.anything());
  });

  it("closes a WebSocket subscription when its caller unsubscribes", () => {
    execute(link, { query: SUBSCRIPTION }).subscribe({}).unsubscribe();

    expect(closeWebSocketSubscription).toHaveBeenCalledTimes(1);
  });
});
