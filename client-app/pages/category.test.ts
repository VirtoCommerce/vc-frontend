import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import { useThemeSnapshot } from "@/core/theme-snapshot";
import { registerPageBuilderSections } from "@/shared/static-content/sections";
import CategoryPage from "./category.vue";
import type { IThemeSnapshot } from "@/core/theme-snapshot";

const listingProps = vi.hoisted<{ value: Record<string, unknown> }>(() => ({ value: {} }));

vi.mock("@/core/composables/useLanguages", () => ({
  useLanguages: () => ({ currentLanguage: ref({ cultureName: "en-US" }), defaultStoreCulture: ref("en-US") }),
}));
vi.mock("@/core/composables", () => ({ useBreadcrumbs: () => [] }));
vi.mock("@/shared/catalog/composables/useCategory", () => ({
  useCategory: () => ({ category: ref({ breadcrumbs: [{ title: "Toner" }] }), fetchCategory: vi.fn() }),
}));
vi.mock("@/shared/catalog/composables/useLoyaltyCatalogCurrency", () => ({ useLoyaltyCatalogCurrency: () => ref() }));
vi.mock("@/shared/layout/composables/useSearchScore", () => ({
  useSearchScore: () => ({ isCategoryScope: ref(false), isScopePending: ref(false), holdScope: vi.fn() }),
}));
vi.mock("@/shared/catalog/components/category.vue", async () => {
  const { defineComponent: define } = await import("vue");
  return {
    default: define({
      inheritAttrs: false,
      setup: (_props, { attrs }) => {
        listingProps.value = attrs;
        return () => null;
      },
    }),
  };
});

const Banner = defineComponent({
  props: { text: { type: String, default: "" } },
  setup: (props) => () => h("aside", { "data-test-id": "category-banner" }, props.text),
});

registerPageBuilderSections({ banner: Banner });

function publish(snapshot: Partial<IThemeSnapshot>): void {
  useThemeSnapshot().setPublished({
    storeId: "store",
    cultureName: "en-US",
    publication: 1,
    menus: [],
    snapshot: { format: 1, publication: 1, cultureName: "en-US", templates: {}, ...snapshot },
  });
}

const wrappers: { unmount: () => void }[] = [];

function mountCategory(props: { categoryId: string; outline?: string }) {
  const wrapper = mount(CategoryPage, {
    props,
    global: { stubs: { VcContainer: { template: "<div><slot /></div>" }, VcBreadcrumbs: true } },
  });
  wrappers.push(wrapper);
  return wrapper;
}

describe("category page", () => {
  beforeEach(() => {
    useThemeSnapshot().setPublished(null);
    listingProps.value = {};
  });

  afterEach(() => {
    wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  });

  it("shows the listing alone in the built-in template", () => {
    const wrapper = mountCategory({ categoryId: "toner" });

    expect(wrapper.findAll('[data-test-id="category-banner"]')).toHaveLength(0);
    expect(wrapper.findComponent({ name: "VcBreadcrumbs" }).exists()).toBe(true);
    expect(listingProps.value).toMatchObject({ "category-id": "toner" });
  });

  it("chooses the template by the slug's outline and renders its sections around the listing", () => {
    publish({
      rules: { version: 2, category: [{ id: "sale", template: "category.sale", when: { inCategory: ["sale"] } }] },
      templates: {
        "category.sale": {
          settings: {},
          content: [
            { id: "top", type: "banner", text: "Above" },
            {
              id: "listing",
              type: "category-listing",
              hideBreadcrumbs: true,
              viewMode: "list",
              hideSidebar: true,
              cardType: "<unset>",
              keyword: "injected",
            },
            { id: "bottom", type: "banner", text: "Below" },
          ],
        },
      },
    });

    const wrapper = mountCategory({ categoryId: "toner", outline: "catalog/sale/toner" });

    expect(wrapper.findAll('[data-test-id="category-banner"]').map((node) => node.text())).toEqual(["Above", "Below"]);
    expect(wrapper.findComponent({ name: "VcBreadcrumbs" }).exists()).toBe(false);
    expect(listingProps.value).toMatchObject({ viewMode: "list", hideSidebar: true });
    expect(listingProps.value).not.toHaveProperty("cardType");
    expect(listingProps.value).not.toHaveProperty("keyword");
  });
});
