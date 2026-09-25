import { shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed, defineComponent, h, ref } from "vue";
import { createI18n } from "@/i18n";
import { uiKit } from "@/ui-kit";
import enMessages from "../../../../locales/en.json";
import ProductCard from "./product-card.vue";
import type { Product } from "@/core/api/graphql/types";
import type { VueWrapper } from "@vue/test-utils";

const catalogFilters = vi.hoisted(() => ({ inStock: false }));

vi.mock("@/core/composables", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/core/composables")>()),
  useBrowserTarget: () => ({ browserTarget: ref("_self") }),
}));

// The card reads the theme context for the vendor eyebrow. Its getter throws when nothing set the
// context, and a computed that throws is not re-run, so only the first mount in a file would fail.
vi.mock("@/core/composables/useThemeContext", () => ({
  useThemeContext: () => ({ themeContext: { value: { settings: {} } } }),
}));

vi.mock("@/core/composables/useModuleSettings", () => ({
  useModuleSettings: () => ({ isEnabled: () => computed(() => false) }),
}));

vi.mock("@/shared/catalog/composables/useCatalogBasePath", () => ({
  useCatalogBasePath: () => computed(() => "/product"),
}));

vi.mock("@/shared/catalog/composables/useProducts", () => ({
  useProducts: () => ({
    products: ref([]),
    pagesCount: computed(() => 1),
    productsFilters: { value: catalogFilters },
    fetchingProducts: ref(false),
    fetchProducts: vi.fn(),
  }),
}));

vi.mock("@/shared/catalog/composables/useProductVariations", () => ({
  useProductVariations: () => ({
    variationsSearchParams: computed(() => ({ page: 1 })),
    updateSearchParams: vi.fn(),
  }),
}));

/**
 * `shallowMount` renders default slots only, but the variations panel lives in a named one, so the
 * card shell is replaced by a stub that renders both.
 */
const ProductCardShellStub = defineComponent({
  name: "VcProductCard",

  setup(_props, { slots }) {
    return () => h("div", [slots.default?.(), slots["expanded-content"]?.()]);
  },
});

function availability(purchasable: boolean) {
  return { isInStock: purchasable, isBuyable: purchasable };
}

/**
 * `siblings` is the length of the `variations` array; the product itself is counted on top of it.
 */
function createProduct(options: { siblings: number; purchasable?: boolean; purchasableSiblings?: number }): Product {
  const { siblings, purchasable = true, purchasableSiblings = siblings } = options;

  return {
    id: "product-id",
    code: "TEST-CODE",
    name: "Test product",
    slug: "test-product",
    hasVariations: true,
    isConfigurable: false,
    images: [],
    properties: [],
    price: { actual: { amount: 10 }, list: { amount: 10 } },
    availabilityData: availability(purchasable),
    variations: Array.from({ length: siblings }, (_, index) => ({
      availabilityData: availability(index < purchasableSiblings),
    })),
  } as unknown as Product;
}

function mountCard(options: Parameters<typeof createProduct>[0]) {
  const i18n = createI18n("en", "USD");
  i18n.global.setLocaleMessage("en", enMessages);

  return shallowMount(ProductCard, {
    props: { product: createProduct(options), viewMode: "list" as const },
    global: {
      plugins: [i18n, uiKit],
      mocks: {
        $cfg: {},
        $canRenderExtensionPoint: () => false,
      },
      stubs: { VcProductCard: ProductCardShellStub, ExtensionPoint: true },
      renderStubDefaultSlot: true,
    },
  });
}

/** Both the expandable button and the link-only one, which carry the same label. */
function buttonLabels(wrapper: VueWrapper): string[] {
  return wrapper
    .findAllComponents({ name: "VcProductButton" })
    .filter(
      (button) =>
        button.classes("product-card__variations-button") || button.classes("product-card__variations-link-button"),
    )
    .map((button) => button.props("buttonText") as string);
}

function panelHeading(wrapper: VueWrapper): string {
  return wrapper.get(".product-card__variants-title").text();
}

beforeEach(() => {
  catalogFilters.inStock = false;
});

describe("product card variations button label", () => {
  it("renders a singular label for a product with no sibling variations", () => {
    expect(buttonLabels(mountCard({ siblings: 0 }))).toEqual(["1 variation", "1 variation"]);
  });

  it("renders a plural label for a product with sibling variations", () => {
    expect(buttonLabels(mountCard({ siblings: 2 }))).toEqual(["3 variations", "3 variations"]);
  });

  it("agrees with the expanded panel heading on the count word", () => {
    const wrapper = mountCard({ siblings: 0 });

    expect(buttonLabels(wrapper)).toEqual(["1 variation", "1 variation"]);
    expect(panelHeading(wrapper)).toBe("1 available variation");
  });
});

describe("product card variations button label with the in-stock filter on", () => {
  beforeEach(() => {
    catalogFilters.inStock = true;
  });

  it("counts only entries a shopper can buy", () => {
    const wrapper = mountCard({ siblings: 3, purchasable: true, purchasableSiblings: 1 });

    expect(buttonLabels(wrapper)).toEqual(["2 variations", "2 variations"]);
  });

  it("agrees with the expanded panel heading when nothing is purchasable", () => {
    const wrapper = mountCard({ siblings: 2, purchasable: false, purchasableSiblings: 0 });

    expect(buttonLabels(wrapper)).toEqual(["No variations", "No variations"]);
    expect(panelHeading(wrapper)).toBe("No available variations");
  });
});
