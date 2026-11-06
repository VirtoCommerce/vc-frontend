import { beforeEach, describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import { isOwnLayoutSlugPage, usePageLayout } from "./usePageLayout";

describe("isOwnLayoutSlugPage", () => {
  it.each([
    ["a product", { objectType: "CatalogProduct", isMarkdown: false }, false],
    ["a category", { objectType: "Category", isMarkdown: false }, false],
    ["a slug that resolves to nothing", { objectType: undefined, isMarkdown: false }, false],
    ["a markdown file page", { objectType: "ContentFile", isMarkdown: true }, false],
    ["a file page", { objectType: "ContentFile", isMarkdown: false }, true],
    ["a Page Builder page", { objectType: "Pages", document: { source: "page-builder" }, isMarkdown: false }, true],
    ["a page whose document is not there yet", { objectType: "Pages", document: null, isMarkdown: false }, true],
    ["a page of another source", { objectType: "Pages", document: { source: "builder.io" }, isMarkdown: false }, false],
  ])("tells whether %s reports its own layout", (_, page, expected) => {
    expect(isOwnLayoutSlugPage(page)).toBe(expected);
  });
});

describe("installPageLayoutRouting", () => {
  const { pageLayout, setPageLayout, installPageLayoutRouting } = usePageLayout();
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/cart", name: "Cart", component: {} },
      { path: "/blocked", name: "Blocked", component: {} },
      { path: "/loyalty-catalog/:pathMatch(.*)*", name: "LoyaltyCatalogMatcher", component: {} },
      { path: "/:pathMatch(.*)*", name: "Matcher", component: {} },
    ],
  });
  router.beforeEach((to) => to.name !== "Blocked");
  installPageLayoutRouting(router);

  beforeEach(async () => {
    await router.push("/landing");
    setPageLayout("minimal");
  });

  it("sets the full layout on a page that is not a slug's", async () => {
    await router.push("/cart");

    expect(pageLayout.value).toBe("full");
  });

  it.each(["/spring-sale", "/loyalty-catalog/gifts"])(
    "keeps the layout until the page of %s reports its own",
    async (path) => {
      await router.push(path);

      expect(pageLayout.value).toBe("minimal");
    },
  );

  it("keeps the layout when a navigation fails", async () => {
    await router.push("/blocked");

    expect(router.currentRoute.value.path).toBe("/landing");
    expect(pageLayout.value).toBe("minimal");
  });
});
