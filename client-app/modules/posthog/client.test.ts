import { describe, it, expect, beforeEach, vi } from "vitest";
import { capture, flushPendingCaptures, getClient, markUnavailable, setClient } from "./client";
import type { PostHog } from "posthog-js";

function fakeClient(): PostHog {
  return { capture: vi.fn() } as unknown as PostHog;
}

describe("posthog client", () => {
  beforeEach(() => {
    setClient(undefined);
  });

  it("captures through the client once it is set", () => {
    const client = fakeClient();
    setClient(client);

    capture("view_item", { value: 1 });

    expect(getClient()).toBe(client);
    expect(client.capture).toHaveBeenCalledWith("view_item", { value: 1 });
  });

  it("keeps events captured before the client exists and sends them on flush, in order", () => {
    capture("form_open", { form_name: "sign_up" });
    capture("$pageview");
    const client = fakeClient();
    setClient(client);
    expect(client.capture).not.toHaveBeenCalled();

    flushPendingCaptures();

    expect(vi.mocked(client.capture).mock.calls).toEqual([
      ["form_open", { form_name: "sign_up" }],
      ["$pageview", undefined],
    ]);
  });

  it("drops the oldest kept events past the limit", () => {
    for (let i = 0; i < 60; i++) {
      capture(`event_${i}`);
    }
    const client = fakeClient();
    setClient(client);

    flushPendingCaptures();

    expect(client.capture).toHaveBeenCalledTimes(50);
    expect(vi.mocked(client.capture).mock.calls[0][0]).toBe("event_10");
  });

  it("drops everything once the SDK is marked unavailable", () => {
    capture("before");
    markUnavailable();
    capture("after");
    const client = fakeClient();
    setClient(client);

    flushPendingCaptures();

    expect(client.capture).not.toHaveBeenCalled();
  });

  it("forgets kept events when the client is cleared", () => {
    capture("stale");
    setClient(undefined);
    const client = fakeClient();
    setClient(client);

    flushPendingCaptures();

    expect(client.capture).not.toHaveBeenCalled();
  });
});
