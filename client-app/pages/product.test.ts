import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { useThemeSnapshot } from "@/core/theme-snapshot";
import { publishTheme } from "@/core/theme-snapshot/published-theme.mock";
import { useThemeTemplates } from "@/shared/static-content/composables/useThemeTemplates";
import { registerPageBuilderSections } from "@/shared/static-content/sections";
import ProductPage from "./product.vue";
import type { Ref } from "vue";

const mocks = vi.hoisted(() => ({
  product: { value: undefined as Record<string, unknown> | undefined },
  loadProduct: vi.fn(),
  fetchProducts: vi.fn(),
}));

// With Site Builder on, sections below the product info mount as they scroll into view; these tests read the whole page.
vi.mock("@/core/theme-snapshot/enabled", () => ({ isSiteBuilderEnabled: () => false }));
vi.mock("@unhead/vue", () => ({ useSeoMeta: () => undefined }));
vi.mock("vue-router", () => ({ useRouter: () => ({ replace: vi.fn() }), useRoute: () => ({ query: {} }) }));
vi.mock("@/core/composables", async () => {
  const { ref: createRef } = await import("vue");
  return {
    useBreadcrumbs: () => [],
    usePageTitle: () => ({ title: createRef() }),
    useSeoKeywords: () => undefined,
  };
});
vi.mock("@/core/composables/useHistoricalEvents", () => ({
  useHistoricalEvents: () => ({ pushHistoricalEvent: vi.fn() }),
}));
vi.mock("@/core/composables/useLanguages", async () => {
  const { ref: createRef } = await import("vue");
  return {
    useLanguages: () => ({
      currentLanguage: createRef({ cultureName: "en-US" }),
      defaultStoreCulture: createRef("en-US"),
      updateLocalizedUrl: vi.fn(),
    }),
  };
});
vi.mock("@/core/composables/useModuleSettings", async () => {
  const { ref: createRef } = await import("vue");
  return { useModuleSettings: () => ({ isEnabled: () => createRef(false) }) };
});
vi.mock("@/shared/cart", async () => {
  const { ref: createRef } = await import("vue");
  return { useShortCart: () => ({ cart: createRef(), loading: createRef(false) }) };
});
vi.mock("@/shared/x-pickup/composables/useXPickup", async () => {
  const { ref: createRef } = await import("vue");
  return { useXPickup: () => ({ xPickupEnabled: createRef(false) }) };
});
vi.mock("@/shared/common", () => ({ FloatingBar: { template: "<div><slot /></div>" } }));
vi.mock("@/shared/catalog/composables/useProductVariationProperties", async () => {
  const { ref: createRef } = await import("vue");
  return { useProductVariationProperties: () => ({ applicableVariations: createRef([]) }) };
});
vi.mock("@/shared/catalog", async () => {
  const { ref: createRef, watch } = await import("vue");
  return {
    useProduct: () => {
      const loaded = createRef<Record<string, unknown>>();
      return {
        product: loaded,
        fetching: createRef(false),
        fetchProduct: vi.fn(async (id: string) => {
          loaded.value = await mocks.loadProduct(id);
        }),
      };
    },
    useConfigurableProduct: () => ({ fetchProductConfiguration: vi.fn(), configuration: createRef([]) }),
    useProductConfigurationSources: () => ({ initialConfiguration: createRef(undefined) }),
    useProducts: () => ({
      fetchingProducts: createRef(false),
      products: createRef([]),
      pagesCount: createRef(1),
      fetchingFacets: createRef(false),
      fetchProducts: (...args: unknown[]) => mocks.fetchProducts(...args),
      hasSelectedFacets: createRef(false),
      isFiltersSidebarVisible: createRef(false),
      productsFilters: createRef({ filters: [], branches: [], inStock: false, purchasedBefore: false }),
      applyFilters: vi.fn(),
      hideFiltersSidebar: vi.fn(),
      resetFacetFilters: vi.fn(),
      showFiltersSidebar: vi.fn(),
    }),
    useProductPickupLocations: () => ({
      pickupLocations: createRef([]),
      fetchPickupLocations: vi.fn(),
      pickupLocationsLoading: createRef(false),
    }),
    useProductVariations: (options: { itemsPerPage: Ref<number> }) => {
      const variationsSearchParams = createRef({ page: 1, itemsPerPage: options.itemsPerPage.value });
      watch(options.itemsPerPage, (itemsPerPage) => {
        variationsSearchParams.value = { page: variationsSearchParams.value.page, itemsPerPage };
      });
      return {
        variationsSearchParams,
        updateSearchParams: (updates: Partial<typeof variationsSearchParams.value>) => {
          variationsSearchParams.value = { ...variationsSearchParams.value, ...updates };
        },
      };
    },
    useLoyaltyCatalogCurrency: () => createRef(),
    ProductVendor: { render: () => null },
    ProductPrice: { render: () => null },
    ProductConfiguration: { render: () => null },
  };
});
vi.mock("@/modules/customer-reviews/components/product-rating.vue", () => ({ default: { render: () => null } }));
vi.mock("@/shared/catalog/components/category/filters-popup-sidebar.vue", () => ({ default: { render: () => null } }));
vi.mock("@/shared/catalog/components/product-pickup-locations.vue", () => ({ default: { render: () => null } }));
vi.mock("@/shared/catalog/components/product-price-block.vue", async () => {
  const { defineComponent: define, h: render } = await import("vue");
  return {
    default: define({
      props: { templateLayout: { type: String, default: undefined } },
      setup: (props) => () => render("div", { "data-test-id": "price-block" }, props.templateLayout),
    }),
  };
});

const Banner = defineComponent({
  props: { text: { type: String, default: "" } },
  setup: (props) => () => h("aside", { "data-test-id": "product-banner" }, props.text),
});

const Reviews = defineComponent({
  setup: () => () => h("section", { "data-test-id": "product-reviews" }),
});

const ProductInfo = defineComponent({
  props: { model: { type: Object, required: true } },
  setup: (props) => () => h("section", { "data-test-id": "product-info", "data-section-id": props.model.id }),
});

const Variations = defineComponent({
  emits: { changePage: (pageNumber: number) => typeof pageNumber === "number" },
  setup: () => () => h("section", { "data-test-id": "product-variations" }),
});

registerPageBuilderSections({ banner: Banner, "product-reviews": Reviews });

function product(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "p1",
    name: "Printer",
    code: "PR-1",
    productType: "Physical",
    hasVariations: false,
    outlines: [{ items: [{ id: "catalog" }, { id: "printers" }] }],
    properties: [],
    breadcrumbs: [],
    availabilityData: { isAvailable: true },
    ...overrides,
  };
}

const wrappers: { unmount: () => void }[] = [];

async function mountProduct() {
  const wrapper = mount(ProductPage, {
    props: { productId: "p1" },
    global: {
      components: { "product-info": ProductInfo, "product-variations": Variations },
      mocks: { $t: (key: string) => key },
      directives: { trackItem: {} },
      stubs: {
        VcContainer: { template: "<div><slot /></div>" },
        VcLayout: { template: "<div><slot /><slot name='sidebar' /></div>" },
        VcBreadcrumbs: true,
        VcTypography: { template: "<h1><slot /></h1>" },
        VcCopyText: { template: "<span><slot /></span>" },
      },
    },
  });
  wrappers.push(wrapper);
  await flushPromises();
  return wrapper;
}

function answerProductLater() {
  let answer!: (loaded: Record<string, unknown>) => void;
  mocks.loadProduct.mockReturnValueOnce(
    new Promise<Record<string, unknown>>((resolve) => {
      answer = resolve;
    }),
  );
  return (loaded: Record<string, unknown>) => answer(loaded);
}

const banners = (wrapper: Awaited<ReturnType<typeof mountProduct>>) =>
  wrapper.findAll('[data-test-id="product-banner"]').map((node) => node.text());

describe("product page", () => {
  beforeEach(() => {
    useThemeSnapshot().setPublished(null);
    mocks.product.value = product();
    mocks.loadProduct.mockReset().mockImplementation(async () => {
      await Promise.resolve();
      return mocks.product.value;
    });
    mocks.fetchProducts.mockReset();
  });

  afterEach(() => {
    wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
    useThemeTemplates().setOpenTemplate(undefined);
  });

  it("renders the theme template's sections before and after the product info, and none hidden", async () => {
    publishTheme({
      rules: { version: 2, product: [] },
      templates: {
        product: {
          settings: {},
          content: [
            { id: "top", type: "banner", text: "Above" },
            { id: "secret", type: "banner", text: "Hidden", hidden: true },
            { id: "info", type: "product-info" },
            { id: "reviews", type: "product-reviews" },
            { id: "bottom", type: "banner", text: "Below" },
          ],
        },
      },
    });

    const wrapper = await mountProduct();
    const html = wrapper.html();
    const order = ["Above", 'data-test-id="product-info"', 'data-test-id="product-reviews"', "Below"].map((text) =>
      html.indexOf(text),
    );

    expect(banners(wrapper)).toEqual(["Above", "Below"]);
    expect(wrapper.find('[data-test-id="product-info"]').attributes("data-section-id")).toBe("info");
    expect(order.every((index, position) => index >= 0 && (position === 0 || order[position - 1] < index))).toBe(true);
    expect(html).not.toContain("Hidden");
  });

  it("loads the variations by a B2C product info and shows its layout in the price block", async () => {
    mocks.product.value = product({ hasVariations: true });
    publishTheme({
      rules: { version: 2, product: [] },
      templates: {
        product: {
          settings: {},
          content: [
            {
              id: "info",
              type: "product-info",
              variationsLayout: "b2c",
              blocks: [{ id: "options", type: "product-options" }],
            },
          ],
        },
      },
    });

    const wrapper = await mountProduct();

    expect(wrapper.find('[data-test-id="price-block"]').text()).toBe("B2C");
    expect(mocks.fetchProducts).toHaveBeenCalledWith({ page: 1, itemsPerPage: 150 }, true);
  });

  it("reloads the variations when the open template switches them to the B2C layout in place", async () => {
    mocks.product.value = product({ hasVariations: true });
    publishTheme({
      rules: { version: 2, product: [] },
      templates: {
        product: {
          settings: {},
          content: [{ id: "info", type: "product-info", blocks: [{ id: "options", type: "product-options" }] }],
        },
      },
    });

    await mountProduct();
    useThemeTemplates().setOpenTemplate("product", {
      settings: {},
      content: [
        {
          id: "info",
          type: "product-info",
          variationsLayout: "b2c",
          blocks: [{ id: "options", type: "product-options" }],
        },
      ],
    });
    await flushPromises();

    expect(mocks.fetchProducts.mock.calls).toEqual([
      [{ page: 1, itemsPerPage: 50 }, false],
      [{ page: 1, itemsPerPage: 150 }, true],
    ]);
  });

  it("reloads the variations from the first page when the open template switches them to the B2C layout", async () => {
    mocks.product.value = product({ hasVariations: true });
    publishTheme({
      rules: { version: 2, product: [] },
      templates: {
        product: {
          settings: {},
          content: [{ id: "info", type: "product-info", blocks: [{ id: "variations", type: "product-variations" }] }],
        },
      },
    });

    const wrapper = await mountProduct();
    wrapper.findComponent(Variations).vm.$emit("changePage", 3);
    await flushPromises();
    useThemeTemplates().setOpenTemplate("product", {
      settings: {},
      content: [
        {
          id: "info",
          type: "product-info",
          variationsLayout: "b2c",
          blocks: [{ id: "variations", type: "product-variations" }],
        },
      ],
    });
    await flushPromises();

    expect(mocks.fetchProducts.mock.calls).toEqual([
      [{ page: 1, itemsPerPage: 50 }, false],
      [{ page: 3, itemsPerPage: 50 }, false],
      [{ page: 1, itemsPerPage: 150 }, true],
    ]);
  });

  it("loads the variations once the open template shows its hidden options block", async () => {
    mocks.product.value = product({ hasVariations: true });
    publishTheme({
      rules: { version: 2, product: [] },
      templates: {
        product: {
          settings: {},
          content: [
            { id: "info", type: "product-info", blocks: [{ id: "options", type: "product-options", hidden: true }] },
          ],
        },
      },
    });

    await mountProduct();
    expect(mocks.fetchProducts).not.toHaveBeenCalled();

    useThemeTemplates().setOpenTemplate("product", {
      settings: {},
      content: [{ id: "info", type: "product-info", blocks: [{ id: "options", type: "product-options" }] }],
    });
    await flushPromises();

    expect(mocks.fetchProducts).toHaveBeenCalledOnce();
  });

  it("loads the variations once for a product whose template switches the layout on navigation", async () => {
    mocks.product.value = product({ hasVariations: true });
    publishTheme({
      rules: {
        version: 2,
        product: [{ id: "digital", template: "product.digital", when: { productType: "Digital" } }],
      },
      templates: {
        product: {
          settings: {},
          content: [{ id: "info", type: "product-info", blocks: [{ id: "options", type: "product-options" }] }],
        },
        "product.digital": {
          settings: {},
          content: [
            {
              id: "info",
              type: "product-info",
              variationsLayout: "b2c",
              blocks: [{ id: "options", type: "product-options" }],
            },
          ],
        },
      },
    });

    const wrapper = await mountProduct();
    mocks.product.value = product({ id: "p2", productType: "Digital", hasVariations: true });
    await wrapper.setProps({ productId: "p2" });
    await flushPromises();

    expect(mocks.fetchProducts.mock.calls).toEqual([
      [{ page: 1, itemsPerPage: 50 }, false],
      [{ page: 1, itemsPerPage: 150 }, true],
    ]);
  });

  it("loads the variations once when the visitor returns to the product before the next one loads", async () => {
    mocks.product.value = product({ hasVariations: true });
    publishTheme({
      rules: {
        version: 2,
        product: [{ id: "digital", template: "product.digital", when: { productType: "Digital" } }],
      },
      templates: {
        product: {
          settings: {},
          content: [{ id: "info", type: "product-info", blocks: [{ id: "options", type: "product-options" }] }],
        },
        "product.digital": {
          settings: {},
          content: [
            {
              id: "info",
              type: "product-info",
              variationsLayout: "b2c",
              blocks: [{ id: "options", type: "product-options" }],
            },
          ],
        },
      },
    });

    const wrapper = await mountProduct();
    const answerNext = answerProductLater();
    const answerReturn = answerProductLater();
    await wrapper.setProps({ productId: "p2" });
    await wrapper.setProps({ productId: "p1" });
    answerNext(product({ id: "p2", productType: "Digital", hasVariations: true }));
    await flushPromises();
    answerReturn(product({ hasVariations: true }));
    await flushPromises();

    expect(mocks.fetchProducts.mock.calls).toEqual([
      [{ page: 1, itemsPerPage: 50 }, false],
      [{ page: 1, itemsPerPage: 50 }, false],
    ]);
  });

  it("renders the product info itself in a template that lost it, after the template's sections", async () => {
    publishTheme({
      rules: { version: 2, product: [] },
      templates: { product: { settings: {}, content: [{ id: "top", type: "banner", text: "Above" }] } },
    });

    const wrapper = await mountProduct();
    const html = wrapper.html();

    expect(wrapper.find('[data-test-id="product-info"]').exists()).toBe(true);
    expect(banners(wrapper)).toEqual(["Above"]);
    expect(html.indexOf("Above")).toBeLessThan(html.indexOf('data-test-id="product-info"'));
    expect(wrapper.find('[data-test-id="price-block"]').text()).toBe("B2B");
  });
});
