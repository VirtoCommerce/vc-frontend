import { flushPromises } from "@vue/test-utils";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import type { Router } from "vue-router";

const hoisted = vi.hoisted(() => ({
  captureMock: vi.fn(),
  queryMock: vi.fn(),
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
      { path: "/shared-list/:sharingKey", name: "SharedList", component: Page },
      { path: "/:pathMatch(.*)*", name: "Matcher", component: Page },
    ],
  });
}

type ViewType = { properties: Record<string, unknown>; path?: string; occurredAt?: Date };

function pageViews(): ViewType[] {
  return hoisted.captureMock.mock.calls
    .filter(([name]) => name === "$pageview")
    .map(([, properties, options]) => ({ properties, ...options }) as ViewType);
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

  it("sends one page view per navigation, with the route name, its page type and its path", async () => {
    const router = buildRouter();
    trackPageViews(router, hoisted.captureMock);

    await router.push("/catalog");
    await router.push("/sign-in");

    expect(pageViews()).toMatchObject([
      { properties: { route_name: "Catalog", page_type: "catalog" }, path: "/catalog" },
      { properties: { route_name: "SignIn", page_type: "sign_in" }, path: "/sign-in" },
    ]);
  });

  it("sends a slug page's view once the slug tells what the page is", async () => {
    const answerSlugLookup = deferSlugLookup();
    const router = buildRouter();
    trackPageViews(router, hoisted.captureMock);

    await router.push("/bolts/carriage-bolt");

    expect(pageViews()).toEqual([]);

    await answerSlugLookup("CatalogProduct");

    expect(pageViews()).toMatchObject([
      { properties: { route_name: "Matcher", page_type: "product" }, path: "/bolts/carriage-bolt" },
    ]);
  });

  it("sends a slug page left before its type came back untyped, as the page and the moment it was viewed", async () => {
    deferSlugLookup();
    const router = buildRouter();
    trackPageViews(router, hoisted.captureMock);

    await router.push("/bolts/carriage-bolt");
    const leftAt = new Date();
    await router.push("/sign-in");

    const [slugView, signInView] = pageViews();
    expect(slugView).toMatchObject({ properties: { route_name: "Matcher" }, path: "/bolts/carriage-bolt" });
    expect(slugView.properties.page_type).toBeUndefined();
    expect(slugView.occurredAt?.getTime()).toBeLessThanOrEqual(leftAt.getTime());
    expect(signInView).toMatchObject({ properties: { page_type: "sign_in" }, path: "/sign-in" });
    expect(pageViews()).toHaveLength(2);
  });

  it("sends a slug page untyped when the lookup fails", async () => {
    hoisted.queryMock.mockRejectedValueOnce(new Error("network"));
    const router = buildRouter();
    trackPageViews(router, hoisted.captureMock);

    await router.push("/bolts/carriage-bolt");
    await flushPromises();

    expect(pageViews()).toHaveLength(1);
    expect(pageViews()[0].properties.page_type).toBeUndefined();
  });

  it("stores a route with a secret in its URL as its pattern", async () => {
    const router = buildRouter();
    trackPageViews(router, hoisted.captureMock);

    await router.push("/shared-list/3f9c-secret-key");

    expect(pageViews()[0].path).toBe("/shared-list/:sharingKey");
  });

  it("sends nothing for a navigation that did not happen", async () => {
    const router = buildRouter();
    router.beforeEach((to) => to.path !== "/sign-in");
    trackPageViews(router, hoisted.captureMock);

    await router.push("/catalog");
    await router.push("/sign-in");

    expect(pageViews()).toHaveLength(1);
  });
});
