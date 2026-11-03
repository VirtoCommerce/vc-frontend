import { describe, it, expect, beforeEach, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import { setGlobals } from "@/core/globals";
import type { RouteLocationNormalizedGeneric } from "vue-router";

const hoisted = vi.hoisted(() => ({
  queryMock: vi.fn(),
}));

vi.mock("@/core/api/graphql/client", () => ({
  apolloClient: { query: hoisted.queryMock },
}));

const { getRoutePageType, getSlugPermalink, resolveSlugPageType } = await import("./page-type");

const Page = { template: "<div />" };

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: "/sign-in", name: "SignIn", component: Page },
    { path: "/product/:productId", name: "Product", component: Page },
    { path: "/:pathMatch(.*)*", name: "Matcher", component: Page },
  ],
});

function route(path: string): RouteLocationNormalizedGeneric {
  return router.resolve(path) as unknown as RouteLocationNormalizedGeneric;
}

function slugInfoResult(slugInfo: unknown): { data: { slugInfo: unknown } } {
  return { data: { slugInfo } };
}

describe("getSlugPermalink", () => {
  it("builds the matcher's permalink from the catch-all path", () => {
    expect(getSlugPermalink(route("/bolts/carriage-bolts/"))).toBe("bolts/carriage-bolts");
    expect(getSlugPermalink(route("/"))).toBe("/");
  });

  it("returns nothing for a named route", () => {
    expect(getSlugPermalink(route("/product/p-1"))).toBeUndefined();
  });
});

describe("getRoutePageType", () => {
  it("names a named route's page after the route", () => {
    expect(getRoutePageType(route("/sign-in"))).toBe("sign_in");
    expect(getRoutePageType(route("/product/p-1"))).toBe("product");
  });

  it("calls the root page home, though it is served by the matcher", () => {
    expect(getRoutePageType(route("/"))).toBe("home");
  });

  it("leaves any other slug URL to the slug lookup", () => {
    expect(getRoutePageType(route("/bolts"))).toBeUndefined();
  });
});

describe("resolveSlugPageType", () => {
  beforeEach(() => {
    hoisted.queryMock.mockReset();
    setGlobals({ storeId: "store-1", userId: "user-1", cultureName: "en-US" });
  });

  it("asks the cached client with the variables of the matcher's own query", async () => {
    hoisted.queryMock.mockResolvedValue(slugInfoResult({ entityInfo: { objectType: "Category" } }));

    await resolveSlugPageType("bolts");

    expect(hoisted.queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { permalink: "bolts", storeId: "store-1", userId: "user-1", cultureName: "en-US" },
        fetchPolicy: "cache-first",
      }),
    );
  });

  it.each([
    ["CatalogProduct", "product"],
    ["Category", "category"],
    ["Catalog", "catalog"],
    ["Brands", "brands"],
    ["Brand", "brand"],
    ["NewsArticle", "news_article"],
    ["Pages", "virto_page"],
    ["ContentFile", "content_page"],
    ["LoyaltyReward", "loyalty_reward"],
  ])("maps the %s object type to %s", async (objectType, pageType) => {
    hoisted.queryMock.mockResolvedValue(slugInfoResult({ entityInfo: { objectType } }));

    expect(await resolveSlugPageType("some-slug")).toBe(pageType);
  });

  it("reports a redirect when the slug only redirects", async () => {
    hoisted.queryMock.mockResolvedValue(slugInfoResult({ entityInfo: null, redirectUrl: "/new-place" }));

    expect(await resolveSlugPageType("old-place")).toBe("redirect");
  });

  it("reports not_found when the slug matches nothing", async () => {
    hoisted.queryMock.mockResolvedValue(slugInfoResult({ entityInfo: null, redirectUrl: null }));

    expect(await resolveSlugPageType("no-such-page")).toBe("not_found");
  });

  it("returns nothing when the lookup has no answer or fails", async () => {
    hoisted.queryMock.mockResolvedValueOnce({ data: {} });
    expect(await resolveSlugPageType("bolts")).toBeUndefined();

    hoisted.queryMock.mockRejectedValueOnce(new Error("network"));
    expect(await resolveSlugPageType("bolts")).toBeUndefined();
  });
});
