import { describe, it, expect, beforeEach, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import type { Router } from "vue-router";

const hoisted = vi.hoisted(() => ({
  captureMock: vi.fn(),
}));

vi.mock("./client", () => ({
  capture: hoisted.captureMock,
}));

const { trackPageViews } = await import("./page-views");

const Page = { template: "<div />" };

function buildRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", name: "Home", component: Page },
      { path: "/catalog", name: "Catalog", component: Page },
    ],
  });
}

function pageViews(): unknown[] {
  return hoisted.captureMock.mock.calls.filter(([name]) => name === "$pageview").map(([, props]) => props);
}

describe("trackPageViews", () => {
  beforeEach(() => {
    hoisted.captureMock.mockReset();
  });

  it("sends one page view per navigation, named after the route", async () => {
    const router = buildRouter();
    trackPageViews(router);

    await router.push("/");
    await router.push("/catalog");

    expect(pageViews()).toEqual([{ route_name: "Home" }, { route_name: "Catalog" }]);
  });

  // `init` awaits the SDK chunk, so the hook is usually registered after the initial navigation has finished.
  it("sends the initial page view exactly once when registered after the initial navigation", async () => {
    const router = buildRouter();
    await router.push("/");
    await router.isReady();

    trackPageViews(router);
    await router.isReady();

    expect(pageViews()).toEqual([{ route_name: "Home" }]);
  });

  it("sends the initial page view exactly once when registered before the initial navigation", async () => {
    const router = buildRouter();
    trackPageViews(router);

    await router.push("/");
    await router.isReady();

    expect(pageViews()).toEqual([{ route_name: "Home" }]);
  });

  it("sends nothing for a navigation that did not happen", async () => {
    const router = buildRouter();
    await router.push("/");
    trackPageViews(router);
    await router.isReady();
    hoisted.captureMock.mockReset();

    await router.push("/");

    expect(pageViews()).toEqual([]);
  });
});
