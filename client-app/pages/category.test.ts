import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import { useThemeSnapshot } from "@/core/theme-snapshot";
import { registerPageBuilderSections } from "@/shared/static-content/sections";
import CategoryPage from "./category.vue";
import type { IThemeSnapshot } from "@/core/theme-snapshot";

const listingProps = vi.hoisted<{ value: Record<string, unknown> }>(() => ({ value: {} }));
const loadedCategory = vi.hoisted<{ value: Record<string, unknown> }>(() => ({ value: {} }));
const fetchedCategory = vi.hoisted<{ value: Record<string, unknown> | undefined }>(() => ({ value: undefined }));
const pageBuilder = vi.hoisted(() => ({ isEnabled: false }));
const heldFetches = vi.hoisted<{ value: Map<string, () => void> | undefined }>(() => ({ value: undefined }));

vi.mock("@/core/theme-snapshot/enabled", () => ({ isNewPageBuilderEnabled: () => pageBuilder.isEnabled }));

vi.mock("@/core/composables/useLanguages", () => ({
  useLanguages: () => ({ currentLanguage: ref({ cultureName: "en-US" }), defaultStoreCulture: ref("en-US") }),
}));
vi.mock("@/core/composables", () => ({ useBreadcrumbs: () => [] }));
vi.mock("@/shared/catalog/composables/useCategory", () => ({
  useCategory: () => {
    const category = ref(loadedCategory.value);

    return {
      category,
      fetchCategory: vi.fn(async ({ categoryId }: { categoryId: string }) => {
        await new Promise<void>((resolve) => {
          if (heldFetches.value) {
            heldFetches.value.set(categoryId, resolve);
          } else {
            resolve();
          }
        });
        category.value = fetchedCategory.value ?? category.value;
      }),
    };
  },
}));
vi.mock("@/shared/catalog/composables/useLoyaltyCatalogCurrency", () => ({ useLoyaltyCatalogCurrency: () => ref() }));
vi.mock("@/shared/layout/composables/useSearchScore", () => ({
  useSearchScore: () => ({ isCategoryScope: ref(false), isScopePending: ref(false), holdScope: vi.fn() }),
}));
vi.mock("@/shared/catalog/components/category.vue", async () => {
  const { defineComponent: define, h: render } = await import("vue");
  return {
    default: define({
      inheritAttrs: false,
      setup: (_props, { attrs }) => {
        listingProps.value = attrs;
        return () => render("section", { "data-test-id": "category-listing-section" });
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
    loadedCategory.value = { breadcrumbs: [{ title: "Toner" }] };
    fetchedCategory.value = undefined;
    pageBuilder.isEnabled = false;
    heldFetches.value = undefined;
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

  it("does not choose the template by the outline of the category shown before", () => {
    publish({
      rules: { version: 2, category: [{ id: "sale", template: "category.sale", when: { inCategory: ["sale"] } }] },
      templates: {
        "category.sale": {
          settings: {},
          content: [
            { id: "top", type: "banner", text: "Above" },
            { id: "listing", type: "category-listing" },
          ],
        },
      },
    });
    loadedCategory.value = { id: "sale-printers", outline: "catalog/sale/sale-printers", breadcrumbs: [] };

    const wrapper = mountCategory({ categoryId: "toner" });

    expect(wrapper.findAll('[data-test-id="category-banner"]')).toHaveLength(0);
  });

  it("waits for a category without the slug's outline before choosing its template", async () => {
    pageBuilder.isEnabled = true;
    publish({
      rules: { version: 2, category: [{ id: "sale", template: "category.sale", when: { inCategory: ["sale"] } }] },
      templates: {
        "category.sale": {
          settings: {},
          content: [
            { id: "top", type: "banner", text: "Above" },
            { id: "listing", type: "category-listing", viewMode: "list" },
          ],
        },
      },
    });
    fetchedCategory.value = { id: "toner", outline: "catalog/sale/toner", breadcrumbs: [] };

    const wrapper = mountCategory({ categoryId: "toner" });

    expect(wrapper.findAll('[data-test-id="category-banner"]')).toHaveLength(0);
    expect(listingProps.value).toEqual({});

    await flushPromises();

    expect(wrapper.findAll('[data-test-id="category-banner"]').map((node) => node.text())).toEqual(["Above"]);
    expect(listingProps.value).toMatchObject({ "category-id": "toner", viewMode: "list" });
  });

  it("shows the category once its request has finished, also when it found nothing", async () => {
    pageBuilder.isEnabled = true;
    fetchedCategory.value = { id: "catalog", breadcrumbs: [] };

    mountCategory({ categoryId: "missing" });
    await flushPromises();

    expect(listingProps.value).toMatchObject({ "category-id": "missing" });
  });

  it("keeps the listing when the previous category's request finishes after the current one's", async () => {
    pageBuilder.isEnabled = true;
    heldFetches.value = new Map();

    const wrapper = mountCategory({ categoryId: "toner" });
    await wrapper.setProps({ categoryId: "paper" });

    heldFetches.value.get("paper")?.();
    await flushPromises();
    heldFetches.value.get("toner")?.();
    await flushPromises();

    expect(wrapper.find('[data-test-id="category-listing-section"]').exists()).toBe(true);
    expect(listingProps.value).toMatchObject({ "category-id": "paper" });
  });
});
