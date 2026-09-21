import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { computed, ref } from "vue";
import { createI18n } from "@/i18n";
import { uiKit } from "@/ui-kit";
import deMessages from "../../../../locales/de.json";
import enMessages from "../../../../locales/en.json";
import ProductCard from "./product-card.vue";
import type { Product } from "@/core/api/graphql/types";
import type { VueWrapper } from "@vue/test-utils";

vi.mock("@/core/composables", () => ({
  useBrowserTarget: () => ({ browserTarget: ref("_self") }),
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
    productsFilters: ref({ inStock: false }),
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

function createI18nWithRealMessages() {
  const i18n = createI18n("en", "USD");
  i18n.global.setLocaleMessage("en", enMessages);
  return i18n;
}

/**
 * `variationsCount` counts the product itself as one of its variations, so a product that shows
 * "1 variation" is seeded with an empty `variations` array.
 */
function createProduct(variationsCount: number): Product {
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
    variations: Array.from({ length: Math.max(variationsCount - 1, 0) }, () => ({})),
  } as unknown as Product;
}

function mountCard(variationsCount: number) {
  return shallowMount(ProductCard, {
    props: { product: createProduct(variationsCount), viewMode: "list" as const },
    global: {
      // The UI kit is registered globally in the app, so the card's children resolve here the
      // same way; `shallowMount` then stubs them, keeping the resolved label inspectable.
      plugins: [createI18nWithRealMessages(), uiKit],
      mocks: {
        $cfg: {},
        $canRenderExtensionPoint: () => false,
      },
      // Registered by the app, not by the UI kit.
      stubs: { ExtensionPoint: true },
      renderStubDefaultSlot: true,
    },
  });
}

function renderedLabel(wrapper: VueWrapper): string | undefined {
  const button = wrapper
    .findAllComponents({ name: "VcProductButton" })
    .find((candidate) => candidate.classes("product-card__variations-button"));

  return button?.props("buttonText") as string | undefined;
}

describe("product card variations button label (VCST-6046)", () => {
  it("renders a singular label for a product with one variation", () => {
    expect(renderedLabel(mountCard(1))).toBe("1 variation");
  });

  it("renders a plural label for a product with several variations", () => {
    expect(renderedLabel(mountCard(3))).toBe("3 variations");
  });

  it("agrees with the expanded panel heading on the count word", () => {
    // The panel heading has always been pluralized; the button used to disagree with it.
    const i18n = createI18nWithRealMessages();

    expect(i18n.global.t("pages.catalog.available_variations", 1)).toBe("1 available variation");
    expect(renderedLabel(mountCard(1))).toBe("1 variation");
  });
});

describe("variations_button message resolution (VCST-6046)", () => {
  it("pluralizes the English message by count", () => {
    const i18n = createI18nWithRealMessages();

    expect(i18n.global.t("pages.catalog.variations_button", [1], 1)).toBe("1 variation");
    expect(i18n.global.t("pages.catalog.variations_button", [2], 2)).toBe("2 variations");
  });

  it("still interpolates a locale whose message has no plural forms", () => {
    // de/ru/ja/... are translated separately and keep a single un-piped form; passing a plural
    // argument must not break their `{0}` interpolation.
    const i18n = createI18n("de", "EUR");
    i18n.global.setLocaleMessage("de", deMessages);
    i18n.global.locale.value = "de";

    expect(i18n.global.t("pages.catalog.variations_button", [1], 1)).toBe("1 Variationen");
    expect(i18n.global.t("pages.catalog.variations_button", [5], 5)).toBe("5 Variationen");
  });
});
