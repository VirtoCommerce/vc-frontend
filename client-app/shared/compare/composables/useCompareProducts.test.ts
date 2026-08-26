import { beforeEach, describe, expect, it, vi } from "vitest";
import { COMPARE_PRODUCTS_LOCAL_STORAGE } from "@/core/constants";
import type { ConfigurableProductOptionInput, ConfigurationSectionInput, Product } from "@/core/api/graphql/types";
import type { Breadcrumb } from "@/core/api/graphql/types";

const hoisted = await vi.hoisted(async () => {
  const { ref } = await import("vue");

  return {
    state: {
      products: ref<unknown[]>([]),
      configurations: ref<unknown[]>([]),
      themeContext: { value: { settings: { product_compare_limit: undefined as number | undefined } } },
    },
    notifications: {
      success: vi.fn(),
      warning: vi.fn(),
      clear: vi.fn(),
    },
    t: vi.fn((key: string) => key),
  };
});

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: hoisted.t }),
}));

vi.mock("@/core/composables/useThemeContext", () => ({
  useThemeContext: () => ({ themeContext: hoisted.state.themeContext }),
}));

vi.mock("@/shared/notification", () => ({
  useNotifications: () => hoisted.notifications,
}));

vi.mock("@vueuse/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@vueuse/core")>();
  return {
    ...actual,
    useLocalStorage: (key: string) =>
      key === COMPARE_PRODUCTS_LOCAL_STORAGE ? hoisted.state.products : hoisted.state.configurations,
  };
});

const { useCompareProducts } = await import("./useCompareProducts");

function breadcrumb(itemId: string, title = itemId): Breadcrumb {
  return { itemId, title, typeName: "Category" };
}

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "product-1",
    name: "Widget",
    isConfigurable: false,
    breadcrumbs: [breadcrumb("cat-a", "Category A")],
    ...overrides,
  } as Product;
}

function productOption(
  productId: string,
  overrides: Partial<ConfigurableProductOptionInput> = {},
): ConfigurableProductOptionInput {
  return { productId, quantity: 1, ...overrides };
}

function configSection(overrides: Partial<ConfigurationSectionInput> = {}): ConfigurationSectionInput {
  return {
    sectionId: "section-1",
    type: "Product",
    option: productOption("opt-1"),
    ...overrides,
  };
}

describe("useCompareProducts", () => {
  beforeEach(() => {
    // lastRemovedEntries/lastRemovedConfigurations are real module-level Vue refs inside
    // useCompareProducts.ts itself (not routed through the mocked useLocalStorage), so a
    // restore buffer left over from a previous test would otherwise leak in here — drain it
    // before resetting storage, so canRestoreProducts starts clean every test.
    useCompareProducts().restoreProducts();
    hoisted.state.products.value = [];
    hoisted.state.configurations.value = [];
    hoisted.state.themeContext.value = { settings: { product_compare_limit: undefined } };
    vi.clearAllMocks();
  });

  describe("addToCompareList — plain products", () => {
    it("adds a plain product with its computed category key", () => {
      const { addToCompareList, products } = useCompareProducts();

      addToCompareList(product({ id: "p1", breadcrumbs: [breadcrumb("cat-a")] }));

      expect(products.value).toEqual([{ productId: "p1", categoryKey: "cat-a" }]);
    });

    it("shows a success toast whose button links straight to that product's category", () => {
      const { addToCompareList } = useCompareProducts();

      addToCompareList(product({ id: "p1", name: "Widget", breadcrumbs: [breadcrumb("cat-a")] }));

      expect(hoisted.notifications.success).toHaveBeenCalledTimes(1);
      const call = hoisted.notifications.success.mock.calls[0][0];
      expect(call.button.to).toEqual({ path: "/compare", query: { category: "cat-a" } });
    });

    it("the toast button's clickHandler clears the compare-products notification group", () => {
      const { addToCompareList } = useCompareProducts();

      addToCompareList(product({ id: "p1" }));

      const call = hoisted.notifications.success.mock.calls[0][0];
      call.button.clickHandler();

      expect(hoisted.notifications.clear).toHaveBeenCalledWith("compare-products");
    });

    it("does not add the same plain product twice", () => {
      const { addToCompareList, products } = useCompareProducts();

      addToCompareList(product({ id: "p1" }));
      addToCompareList(product({ id: "p1" }));

      expect(products.value).toHaveLength(1);
      // Only the first call should have produced a success toast.
      expect(hoisted.notifications.success).toHaveBeenCalledTimes(1);
    });
  });

  describe("addToCompareList — configured products", () => {
    it("adds distinct entries for two different configurations of the same product", () => {
      const { addToCompareList, products } = useCompareProducts();
      const p = product({ id: "p1", isConfigurable: true });

      addToCompareList(p, [configSection({ option: productOption("opt-1") })]);
      addToCompareList(p, [configSection({ option: productOption("opt-2") })]);

      expect(products.value).toHaveLength(2);
      expect(products.value[0].localId).toBeDefined();
      expect(products.value[0].localId).not.toBe(products.value[1].localId);
    });

    it("does not add the same configuration twice", () => {
      const { addToCompareList, products } = useCompareProducts();
      const p = product({ id: "p1", isConfigurable: true });
      const config = [configSection({ option: productOption("opt-1") })];

      addToCompareList(p, config);
      addToCompareList(p, [configSection({ option: productOption("opt-1") })]); // same option, new array instance

      expect(products.value).toHaveLength(1);
    });

    it("records the configuration in local storage keyed by the entry's localId", () => {
      const { addToCompareList, products } = useCompareProducts();
      const p = product({ id: "p1", isConfigurable: true });

      addToCompareList(p, [configSection({ sectionId: "s1", option: productOption("opt-1") })]);

      const [entry] = products.value;
      expect(hoisted.state.configurations.value).toEqual([
        {
          localId: entry.localId,
          configuration: [
            {
              sectionId: "s1",
              type: "Product",
              option: productOption("opt-1"),
              productId: "opt-1",
              quantity: 1,
              id: "s1",
            },
          ],
        },
      ]);
    });

    it("strips File-type sections before comparing/storing configurations", () => {
      const { addToCompareList, products } = useCompareProducts();
      const p = product({ id: "p1", isConfigurable: true });

      addToCompareList(p, [
        configSection({ sectionId: "s1", type: "Product", option: productOption("opt-1") }),
        configSection({ sectionId: "s2", type: "File", fileUrls: ["a.pdf"] }),
      ]);

      expect(products.value[0].configurationSectionInput).toEqual([
        { sectionId: "s1", type: "Product", option: productOption("opt-1") },
      ]);
    });

    it("treats a configurable product with an empty configuration as a plain entry", () => {
      const { addToCompareList, products } = useCompareProducts();

      addToCompareList(product({ id: "p1", isConfigurable: true }), []);

      expect(products.value).toEqual([{ productId: "p1", categoryKey: "cat-a" }]);
    });
  });

  describe("per-category limit", () => {
    it("blocks adding once the category is at the limit and shows a warning toast, without adding", () => {
      hoisted.state.products.value = Array.from({ length: 5 }, (_, i) => ({
        productId: `existing-${i}`,
        categoryKey: "cat-a",
      }));
      const { addToCompareList, products } = useCompareProducts();

      addToCompareList(product({ id: "new-product", breadcrumbs: [breadcrumb("cat-a")] }));

      expect(products.value).toHaveLength(5);
      expect(hoisted.notifications.warning).toHaveBeenCalledTimes(1);
      expect(hoisted.notifications.success).not.toHaveBeenCalled();
      expect(hoisted.t).toHaveBeenCalledWith("shared.compare.notifications.limit_reached", { productsLimit: 5 });
    });

    it("respects a custom product_compare_limit theme setting", () => {
      hoisted.state.themeContext.value = { settings: { product_compare_limit: 2 } };
      hoisted.state.products.value = [
        { productId: "e1", categoryKey: "cat-a" },
        { productId: "e2", categoryKey: "cat-a" },
      ];
      const { addToCompareList, products } = useCompareProducts();

      addToCompareList(product({ id: "new-product", breadcrumbs: [breadcrumb("cat-a")] }));

      expect(products.value).toHaveLength(2);
      expect(hoisted.notifications.warning).toHaveBeenCalledTimes(1);
    });

    it("the limit is per category — a full category does not block adding to a different one", () => {
      hoisted.state.products.value = Array.from({ length: 5 }, (_, i) => ({
        productId: `existing-${i}`,
        categoryKey: "cat-a",
      }));
      const { addToCompareList, products } = useCompareProducts();

      addToCompareList(product({ id: "new-product", breadcrumbs: [breadcrumb("cat-b")] }));

      expect(products.value).toHaveLength(6);
      expect(hoisted.notifications.success).toHaveBeenCalledTimes(1);
    });

    it("reports the correct itemsLeft in the success toast", () => {
      hoisted.state.products.value = [{ productId: "e1", categoryKey: "cat-a" }];
      const { addToCompareList } = useCompareProducts();

      addToCompareList(product({ id: "new-product", breadcrumbs: [breadcrumb("cat-a")] }));

      // 5 (default limit) - 1 (existing) - 1 (the one just added) = 3 left.
      expect(hoisted.t).toHaveBeenCalledWith(
        "shared.compare.notifications.added_html",
        expect.objectContaining({ itemsLeft: 3 }),
      );
    });

    it("products (exposed) is clamped per category even if storage already holds more than the limit", () => {
      hoisted.state.products.value = Array.from({ length: 7 }, (_, i) => ({
        productId: `existing-${i}`,
        categoryKey: "cat-a",
      }));
      const { products, getCategoryProductsCount } = useCompareProducts();

      expect(products.value).toHaveLength(5);
      expect(getCategoryProductsCount("cat-a")).toBe(5);
    });
  });

  describe("removeFromCompareList", () => {
    it("removes a plain product by id", () => {
      hoisted.state.products.value = [{ productId: "p1", categoryKey: "cat-a" }];
      const { removeFromCompareList, products } = useCompareProducts();

      removeFromCompareList(product({ id: "p1" }));

      expect(products.value).toEqual([]);
      expect(hoisted.notifications.warning).toHaveBeenCalledTimes(1);
    });

    it("removes only the matching configured entry, leaving other configurations of the same product", () => {
      const { addToCompareList, removeFromCompareList, products } = useCompareProducts();
      const p = product({ id: "p1", isConfigurable: true });
      const configA = [configSection({ option: productOption("opt-a") })];
      const configB = [configSection({ option: productOption("opt-b") })];

      addToCompareList(p, configA);
      addToCompareList(p, configB);
      expect(products.value).toHaveLength(2);

      removeFromCompareList(p, configA);

      expect(products.value).toHaveLength(1);
      expect(products.value[0].configurationSectionInput).toEqual(configB);
    });

    it("also removes the entry's stored configuration", () => {
      const { addToCompareList, removeFromCompareList } = useCompareProducts();
      const p = product({ id: "p1", isConfigurable: true });

      addToCompareList(p, [configSection()]);
      expect(hoisted.state.configurations.value).toHaveLength(1);

      removeFromCompareList(p, [configSection()]);

      expect(hoisted.state.configurations.value).toHaveLength(0);
    });

    it("is a no-op with no toast when the product is not in the list", () => {
      const { removeFromCompareList, products } = useCompareProducts();

      removeFromCompareList(product({ id: "not-there" }));

      expect(products.value).toEqual([]);
      expect(hoisted.notifications.warning).not.toHaveBeenCalled();
    });
  });

  describe("clearCategory", () => {
    it("removes only the given category's entries", () => {
      hoisted.state.products.value = [
        { productId: "p1", categoryKey: "cat-a" },
        { productId: "p2", categoryKey: "cat-b" },
      ];
      const { clearCategory, products } = useCompareProducts();

      clearCategory("cat-a");

      expect(products.value).toEqual([{ productId: "p2", categoryKey: "cat-b" }]);
    });

    it("is restorable when it was the only remaining category", () => {
      hoisted.state.products.value = [{ productId: "p1", categoryKey: "cat-a" }];
      const { clearCategory, restoreProducts, products, canRestoreProducts } = useCompareProducts();

      clearCategory("cat-a");
      expect(canRestoreProducts.value).toBe(true);

      restoreProducts();
      expect(products.value).toEqual([{ productId: "p1", categoryKey: "cat-a" }]);
    });

    it("does not set up a restore buffer when other categories remain", () => {
      hoisted.state.products.value = [
        { productId: "p1", categoryKey: "cat-a" },
        { productId: "p2", categoryKey: "cat-b" },
      ];
      const { clearCategory, canRestoreProducts } = useCompareProducts();

      clearCategory("cat-a");

      expect(canRestoreProducts.value).toBe(false);
    });

    it("is a no-op for a category with no entries", () => {
      hoisted.state.products.value = [{ productId: "p1", categoryKey: "cat-a" }];
      const { clearCategory, products } = useCompareProducts();

      clearCategory("cat-nonexistent");

      expect(products.value).toHaveLength(1);
    });
  });

  describe("clearCompareList / restoreProducts", () => {
    it("empties the list and makes it restorable", () => {
      hoisted.state.products.value = [
        { productId: "p1", categoryKey: "cat-a" },
        { productId: "p2", categoryKey: "cat-b" },
      ];
      const { clearCompareList, products, canRestoreProducts } = useCompareProducts();

      clearCompareList();

      expect(products.value).toEqual([]);
      expect(canRestoreProducts.value).toBe(true);
    });

    it("is a no-op when already empty", () => {
      const { clearCompareList, canRestoreProducts } = useCompareProducts();

      clearCompareList();

      expect(canRestoreProducts.value).toBe(false);
    });

    it("restoreProducts brings back exactly what was cleared, once", () => {
      hoisted.state.products.value = [{ productId: "p1", categoryKey: "cat-a" }];
      const { clearCompareList, restoreProducts, products, canRestoreProducts } = useCompareProducts();

      clearCompareList();
      restoreProducts();

      expect(products.value).toEqual([{ productId: "p1", categoryKey: "cat-a" }]);
      expect(canRestoreProducts.value).toBe(false);

      // A second restore is a no-op — the buffer was drained by the first one.
      hoisted.state.products.value = [];
      restoreProducts();
      expect(products.value).toEqual([]);
    });

    it("restoreProducts also brings back the associated configurations", () => {
      const { addToCompareList, clearCompareList, restoreProducts } = useCompareProducts();
      addToCompareList(product({ id: "p1", isConfigurable: true }), [configSection()]);

      clearCompareList();
      expect(hoisted.state.configurations.value).toHaveLength(0);

      restoreProducts();
      expect(hoisted.state.configurations.value).toHaveLength(1);
    });
  });

  describe("isInCompareList", () => {
    it("is true for a plain product already in the list", () => {
      hoisted.state.products.value = [{ productId: "p1", categoryKey: "cat-a" }];
      const { isInCompareList } = useCompareProducts();

      expect(isInCompareList(product({ id: "p1" }))).toBe(true);
      expect(isInCompareList(product({ id: "p2" }))).toBe(false);
    });

    it("distinguishes configured entries by their configuration, not just productId", () => {
      const { addToCompareList, isInCompareList } = useCompareProducts();
      const p = product({ id: "p1", isConfigurable: true });
      const configA = [configSection({ option: productOption("opt-a") })];
      const configB = [configSection({ option: productOption("opt-b") })];

      addToCompareList(p, configA);

      expect(isInCompareList(p, configA)).toBe(true);
      expect(isInCompareList(p, configB)).toBe(false);
    });
  });
});
