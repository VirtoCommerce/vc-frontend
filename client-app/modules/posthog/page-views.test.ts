import { flushPromises } from "@vue/test-utils";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import type { Router } from "vue-router";

const hoisted = vi.hoisted(() => ({
  captureMock: vi.fn(),
  queryMock: vi.fn(),
}));

vi.mock("./client", () => ({
  capture: hoisted.captureMock,
}));

vi.mock("@/core/api/graphql/client", () => ({
  apolloClient: { query: hoisted.queryMock },
}));

const { trackPageViews } = await import("./page-views");

const Page = { template: "<div />" };

function buildRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/catalog", name: "Catalog", component: Page },
      { path: "/sign-in", name: "SignIn", component: Page },
      { path: "/:pathMatch(.*)*", name: "Matcher", component: Page },
    ],
  });
}

function pageViews(): unknown[] {
  return hoisted.captureMock.mock.calls.filter(([name]) => name === "$pageview").map(([, props]) => props);
}

/** A slug lookup the test answers when it wants to, with the given object type. */
function deferSlugLookup(): (objectType: string) => Promise<void> {
  let answer: ((value: unknown) => void) | undefined;
  hoisted.queryMock.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        answer = resolve;
      }),
  );
  return async (objectType) => {
    answer?.({ data: { slugInfo: { entityInfo: { objectType } } } });
    await flushPromises();
  };
}

describe("trackPageViews", () => {
  beforeEach(() => {
    hoisted.captureMock.mockReset();
    hoisted.queryMock.mockReset();
  });

  it("sends one page view per navigation, with the route name and its page type", async () => {
    const router = buildRouter();
    trackPageViews(router);

    await router.push("/");
    await router.push("/catalog");
    await router.push("/sign-in");

    expect(pageViews()).toEqual([
      { route_name: "Matcher", page_type: "home" },
      { route_name: "Catalog", page_type: "catalog" },
      { route_name: "SignIn", page_type: "sign_in" },
    ]);
    expect(hoisted.queryMock).not.toHaveBeenCalled();
  });

  it("sends a slug page's view once the slug tells what the page is", async () => {
    const router = buildRouter();
    trackPageViews(router);
    await router.push("/");
    hoisted.captureMock.mockReset();
    const answerSlug = deferSlugLookup();

    await router.push("/bolts/carriage-bolt");
    expect(pageViews()).toEqual([]);

    await answerSlug("CatalogProduct");
    expect(pageViews()).toEqual([{ route_name: "Matcher", page_type: "product" }]);
  });

  it("sends a slug page left before its type came back untyped, ahead of the next view", async () => {
    const router = buildRouter();
    trackPageViews(router);
    await router.push("/");
    hoisted.captureMock.mockReset();
    const answerSlug = deferSlugLookup();

    await router.push("/bolts");
    await router.push("/sign-in");
    await answerSlug("Category");

    expect(pageViews()).toEqual([
      { route_name: "Matcher", page_type: undefined },
      { route_name: "SignIn", page_type: "sign_in" },
    ]);
  });

  it("sends a slug page untyped when the lookup fails", async () => {
    const router = buildRouter();
    trackPageViews(router);
    await router.push("/");
    hoisted.captureMock.mockReset();
    hoisted.queryMock.mockRejectedValueOnce(new Error("network"));

    await router.push("/bolts");
    await flushPromises();

    expect(pageViews()).toEqual([{ route_name: "Matcher", page_type: undefined }]);
  });

  // `init` awaits the SDK chunk, so the hook is usually registered after the initial navigation has finished.
  it("sends the initial page view exactly once when registered after the initial navigation", async () => {
    const router = buildRouter();
    await router.push("/catalog");
    await router.isReady();

    trackPageViews(router);
    await router.isReady();

    expect(pageViews()).toEqual([{ route_name: "Catalog", page_type: "catalog" }]);
  });

  it("sends the initial page view exactly once when registered before the initial navigation", async () => {
    const router = buildRouter();
    trackPageViews(router);

    await router.push("/catalog");
    await router.isReady();

    expect(pageViews()).toEqual([{ route_name: "Catalog", page_type: "catalog" }]);
  });

  it("sends nothing for a navigation that did not happen", async () => {
    const router = buildRouter();
    await router.push("/catalog");
    trackPageViews(router);
    await router.isReady();
    hoisted.captureMock.mockReset();

    await router.push("/catalog");

    expect(pageViews()).toEqual([]);
  });
});
