import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import { useThemeSnapshot } from "@/core/theme-snapshot";
import { usePageLayout } from "@/shared/layout/composables/usePageLayout";
import { chooseLandingPageLayout, mergePageSettings, setLandingPageLayout } from "./page-layout";
import { useThemeTemplates } from "./useThemeTemplates";
import type { ILandingLayoutOptions } from "./page-layout";
import type { IThemeSlug, IThemeSnapshot } from "@/core/theme-snapshot";

const enabled = vi.hoisted(() => ({ value: true }));

vi.mock("@/core/theme-snapshot/enabled", () => ({ isNewPageBuilderEnabled: () => enabled.value }));
vi.mock("@/core/composables/useLanguages", () => ({
  useLanguages: () => ({ currentLanguage: ref({ cultureName: "en-US" }), defaultStoreCulture: ref("en-US") }),
}));

const SNAPSHOT: Partial<IThemeSnapshot> = {
  rules: {
    version: 2,
    page: [
      { id: "campaign", template: "page.campaign", when: { setting: { name: "campaign", equals: "spring" } } },
      { id: "docs", template: "page.docs", when: { path: "docs/*", source: "ContentFile" } },
    ],
  },
  templates: {
    page: { settings: { layout: "full" }, content: [] },
    "page.campaign": { settings: { layout: "minimal" }, content: [] },
    "page.docs": { settings: { layout: "blank" }, content: [] },
    "page.bare": { settings: { layout: "blank" }, content: [] },
  },
};

function publish(slug?: IThemeSlug): void {
  useThemeSnapshot().setPublished({
    storeId: "store",
    cultureName: "en-US",
    publication: 1,
    menus: [],
    snapshot: { format: 1, publication: 1, cultureName: "en-US", templates: {}, ...SNAPSHOT },
    slug,
  });
}

function pageSlug(settings?: Record<string, unknown>, source = "page-builder"): IThemeSlug {
  return {
    permalink: "spring",
    objectType: "Pages",
    objectId: "page-1",
    page: { source, permalink: "/spring", settings },
  };
}

function choose(slug: IThemeSlug | undefined, overrides: Partial<ILandingLayoutOptions> = {}) {
  return chooseLandingPageLayout({
    slug,
    permalink: slug?.permalink,
    entity: slug && { objectType: slug.objectType, objectId: slug.objectId },
    path: "/spring",
    language: "en-US",
    resolveTemplate: useThemeTemplates().resolveTemplate,
    ...overrides,
  });
}

describe("mergePageSettings", () => {
  it("puts the page's settings over its template's, except those it left empty", () => {
    expect(
      mergePageSettings(
        { layout: "minimal", header: "Sale" },
        { layout: null, header: "Spring", hideBreadcrumbs: true },
      ),
    ).toEqual({ layout: "minimal", header: "Spring", hideBreadcrumbs: true });
  });
});

describe("chooseLandingPageLayout", () => {
  beforeEach(() => {
    publish();
  });

  it.each(["CatalogProduct", "Category", "Catalog", "Brand", "NewsArticle"])("gives a %s the full layout", (type) => {
    expect(choose({ permalink: "printers/laser", objectType: type, objectId: "1" })).toBe("full");
  });

  it("gives a page of another source the full layout", () => {
    expect(choose(pageSlug(undefined, "builder.io"))).toBe("full");
  });

  it.each([
    ["its own layout", { layout: "blank", campaign: "spring" }, "blank"],
    ["the layout of the template a rule picks by its setting", { campaign: "spring" }, "minimal"],
    ["the layout of its own template", { template: "page.bare", campaign: "spring" }, "blank"],
    ["the layout of the page type's template", {}, "full"],
    ["the full layout for a layout that is not one", { layout: "wide" }, "full"],
  ])("gives a Page Builder page %s", (_, settings, expected) => {
    expect(choose(pageSlug(settings))).toBe(expected);
  });

  it("checks a file page's rules against the landing path and its source", () => {
    const slug: IThemeSlug = {
      permalink: "docs/setup",
      objectType: "ContentFile",
      objectId: "file-1",
      page: { permalink: "/docs/setup", settings: {} },
    };

    expect(choose(slug, { path: "/docs/setup" })).toBe("blank");
    expect(choose(slug, { path: "/other" })).toBe("full");
  });

  it.each<[string, IThemeSlug | undefined, Partial<ILandingLayoutOptions>]>([
    ["nothing at the permalink", undefined, {}],
    ["a landing route that is not a slug route", pageSlug({}), { permalink: undefined }],
    ["a response for another permalink", pageSlug({}), { permalink: "summer" }],
    ["another object for the visitor", pageSlug({}), { entity: { objectType: "Pages", objectId: "page-2" } }],
    ["nothing for the visitor", pageSlug({}), { entity: null }],
    ["a page the server did not read", { permalink: "spring", objectType: "Pages", objectId: "page-1" }, {}],
    ["a Page Builder page without settings", pageSlug(), {}],
    [
      "a file page without settings, such as a markdown one",
      { permalink: "spring", objectType: "ContentFile", objectId: "file-1", page: { permalink: "/spring" } },
      {},
    ],
  ])("leaves the layout to the page for %s", (_, slug, overrides) => {
    expect(choose(slug, overrides)).toBeUndefined();
  });
});

describe("setLandingPageLayout", () => {
  const routes = [
    { path: "/cart", name: "Cart", component: {} },
    { path: "/:pathMatch(.*)*", name: "Matcher", component: {} },
  ];

  function createLandingRouter(path: string) {
    const history = createMemoryHistory();
    history.replace(path);
    return createRouter({ history, routes });
  }

  beforeEach(() => {
    enabled.value = true;
    usePageLayout().setPageLayout("full");
  });

  it("sets the landing page's layout before the router starts", () => {
    publish(pageSlug({ campaign: "spring" }));

    setLandingPageLayout(createLandingRouter("/spring/"), { objectType: "Pages", objectId: "page-1" });

    expect(usePageLayout().pageLayout.value).toBe("minimal");
  });

  it.each([
    ["the response says nothing about the permalink", undefined, "/spring"],
    ["the landing route is not a slug route", pageSlug({ campaign: "spring" }), "/cart"],
  ])("sets nothing when %s", (_, slug, path) => {
    publish(slug);

    setLandingPageLayout(createLandingRouter(path), { objectType: "Pages", objectId: "page-1" });

    expect(usePageLayout().pageLayout.value).toBe("full");
  });

  it("sets nothing without the new Page Builder", () => {
    enabled.value = false;
    publish(pageSlug({ campaign: "spring" }));

    setLandingPageLayout(createLandingRouter("/spring"), { objectType: "Pages", objectId: "page-1" });

    expect(usePageLayout().pageLayout.value).toBe("full");
  });
});
