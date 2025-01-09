import { flushPromises } from "@vue/test-utils";
import { describe, it, expect, beforeEach, vi, beforeAll, afterEach } from "vitest";
import { ref } from "vue";
import { useConfigurableProduct } from "@/shared/catalog/composables/useConfigurableProduct";
import type { CreateConfiguredLineItemMutationVariables } from "@/core/api/graphql/types";
import type { Mock } from "vitest";

const TIMER_DELAY = 1000;

const mocks = vi.hoisted(() => ({
  getProductConfiguration: vi.fn(),
  getConfigurationItems: vi.fn(),
  useCreateConfiguredLineItemMutation: vi.fn(),
  getUrlSearchParamMock: vi.fn(),
  useShortCartMock: vi.fn(),
}));

vi.mock("@/core/api/graphql", async () => {
  const actual = await vi.importActual<typeof import("@/core/api/graphql")>("@/core/api/graphql");
  return {
    ...actual,
    getProductConfiguration: mocks.getProductConfiguration,
    useCreateConfiguredLineItemMutation: mocks.useCreateConfiguredLineItemMutation,
    getConfigurationItems: mocks.getConfigurationItems,
  };
});

vi.mock("@/core/utilities", () => ({
  Logger: {
    error: vi.fn(),
    debug: vi.fn(),
  },
  getUrlSearchParam: mocks.getUrlSearchParamMock,
}));

vi.mock("@/shared/cart/composables", async () => {
  const actual = await vi.importActual<typeof import("@/shared/cart/composables")>("@/shared/cart/composables");
  return {
    ...actual,
    useShortCart: mocks.useShortCartMock,
  };
});

describe("useConfigurableProduct", () => {
  type UseConfigurableProductType =
    typeof import("@/shared/catalog/composables/useConfigurableProduct").useConfigurableProduct;

  let composable: ReturnType<UseConfigurableProductType>;
  const configurableProductId = "test-product-id";
  let createConfiguredLineItemMutationMock: Mock;

  beforeAll(() => {
    createConfiguredLineItemMutationMock = vi.fn();
    mocks.useCreateConfiguredLineItemMutation.mockReturnValue({
      mutate: createConfiguredLineItemMutationMock,
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("without preselected values", () => {
    beforeEach(() => {
      mocks.getUrlSearchParamMock.mockReturnValue(null);
      mocks.useShortCartMock.mockReturnValue({
        cart: ref({
          id: "cart-id-1",
          items: [],
        }),
      });
      composable = useConfigurableProduct(configurableProductId);
    });

    it("should initialize with correct default state", () => {
      expect(composable.configuration.value).toEqual([]);
      expect(composable.selectedConfiguration.value).toEqual({});
      expect(composable.selectedConfigurationInput.value).toEqual([]);
      expect(composable.configuredLineItem.value).toBeUndefined();
      expect(composable.loading.value).toBe(false);
    });

    it("should fetch product configuration and set configuration ref", async () => {
      const mockConfiguration = {
        configurationSections: [createConfigurationSection(1, { isRequired: true }), createConfigurationSection(2)],
      };
      mocks.getProductConfiguration.mockResolvedValue(mockConfiguration);

      await composable.fetchProductConfiguration();

      expect(mocks.getProductConfiguration).toHaveBeenCalledWith(configurableProductId);
      expect(mocks.getConfigurationItems).not.toHaveBeenCalled();
      expect(composable.configuration.value).toEqual(mockConfiguration.configurationSections);

      expect(composable.selectedConfiguration.value).toEqual({
        "Section 1": {
          productId: "product-1",
          quantity: 1,
          selectedProductTitle: "Product 1",
        },
      });
    });

    it("should update selectedConfiguration when selectSectionValue is called", async () => {
      const mockConfiguration = {
        configurationSections: [
          createConfigurationSection(1, { isRequired: true, products: [1, 2] }),
          createConfigurationSection(2, { isRequired: false, products: [3, 4] }),
        ],
      };
      mocks.getProductConfiguration.mockResolvedValue(mockConfiguration);

      await composable.fetchProductConfiguration();

      composable.selectSectionValue({
        sectionId: "Section 2",
        value: {
          productId: "product-3",
          quantity: 1,
        },
      });

      expect(composable.selectedConfiguration.value).toEqual({
        "Section 1": {
          productId: "product-1",
          quantity: 1,
          selectedProductTitle: "Product 1",
        },
        "Section 2": {
          productId: "product-3",
          quantity: 1,
          selectedProductTitle: "Product 3",
        },
      });
    });

    it("should call createConfiguredLineItem when selectedConfigurationInput changes", async () => {
      const mockConfiguration = {
        configurationSections: [createConfigurationSection(1, { isRequired: false })],
      };

      mocks.getProductConfiguration.mockResolvedValue(mockConfiguration);

      const mockCreateConfiguredLineItemResponse = {
        data: {
          createConfiguredLineItem: {
            id: "configured-line-item-1", // just a mock data, in reality there is different structure
          },
        },
      };

      createConfiguredLineItemMutationMock.mockResolvedValue(mockCreateConfiguredLineItemResponse);

      await composable.fetchProductConfiguration();
      vi.advanceTimersByTime(TIMER_DELAY);
      await flushPromises();

      composable.selectSectionValue({
        sectionId: "Section 1",
        value: {
          productId: "product-2",
          quantity: 1,
        },
      });

      await flushPromises();
      vi.advanceTimersByTime(TIMER_DELAY);

      const firstCallArguments = createConfiguredLineItemMutationMock.mock
        .calls[0] as CreateConfiguredLineItemMutationVariables[];
      const secondCallArguments = createConfiguredLineItemMutationMock.mock
        .calls[1] as CreateConfiguredLineItemMutationVariables[];

      expect(firstCallArguments[0]).toEqual({
        command: {
          configurableProductId,
          configurationSections: [],
        },
      });

      expect(createConfiguredLineItemMutationMock).toBeCalledTimes(2);

      expect(secondCallArguments[0]).toEqual({
        command: {
          configurableProductId,
          configurationSections: [
            {
              sectionId: "Section 1",
              value: {
                productId: "product-2",
                quantity: 1,
              },
            },
          ],
        },
      });

      expect(composable.configuredLineItem.value).toEqual(
        mockCreateConfiguredLineItemResponse.data.createConfiguredLineItem,
      );
    });

    it("should set loading to true when fetching or creating", async () => {
      const mockConfiguration = {
        configurationSections: [],
      };
      mocks.getProductConfiguration.mockImplementation(() => {
        expect(composable.loading.value).toBe(true);
        return mockConfiguration;
      });

      await composable.fetchProductConfiguration();

      createConfiguredLineItemMutationMock.mockImplementation(() => {
        expect(composable.loading.value).toBe(true);
        return Promise.resolve({});
      });

      composable.selectSectionValue({
        sectionId: "Section 1",
        value: {
          productId: "product-1",
          quantity: 1,
        },
      });
      await flushPromises();
      vi.advanceTimersByTime(TIMER_DELAY);
      await flushPromises();

      expect(composable.loading.value).toBe(false);
    });

    it("should not call createConfiguredLineItem if selectedConfigurationInput does not change", async () => {
      const mockConfiguration = {
        configurationSections: [createConfigurationSection(1)],
      };
      mocks.getProductConfiguration.mockResolvedValue(mockConfiguration);

      await composable.fetchProductConfiguration();
      vi.advanceTimersByTime(TIMER_DELAY);
      await flushPromises();

      composable.selectSectionValue({
        sectionId: "Section 1",
        value: {
          productId: "product-1",
          quantity: 1,
        },
      });

      await flushPromises();
      expect(createConfiguredLineItemMutationMock).toBeCalledTimes(1); // Only the initial call
    });
  });

  describe("with preselected values", () => {
    beforeEach(() => {
      mocks.getUrlSearchParamMock.mockReturnValue("line-item-1");
      mocks.useShortCartMock.mockReturnValue({
        cart: ref({
          id: "cart-id-1",
        }),
      });
      mocks.getConfigurationItems.mockResolvedValue({
        configurationItems: [
          {
            sectionId: "Section 1",
            productId: "product-2",
            quantity: 1,
          },
          {
            sectionId: "Section 2",
            productId: "product-4",
            quantity: 2,
          },
        ],
      });

      composable = useConfigurableProduct(configurableProductId);
    });

    it("should initialize selectedConfigurationInput with preselected values", async () => {
      const mockConfiguration = {
        configurationSections: [
          createConfigurationSection(1, { isRequired: true, products: [1, 2] }),
          createConfigurationSection(2, { isRequired: false, products: [3, 4] }),
          createConfigurationSection(3, { isRequired: true, products: [5, 6] }),
        ],
      };
      mocks.getProductConfiguration.mockResolvedValue(mockConfiguration);

      createConfiguredLineItemMutationMock.mockResolvedValue({
        data: {
          createConfiguredLineItem: {
            id: "configured-line-item-1",
          },
        },
      });

      await composable.fetchProductConfiguration();
      vi.advanceTimersByTime(TIMER_DELAY);
      await flushPromises();

      expect(mocks.getConfigurationItems).toHaveBeenCalledWith("line-item-1", "cart-id-1");

      expect(composable.selectedConfigurationInput.value).toEqual([
        {
          sectionId: "Section 1",
          value: {
            productId: "product-2",
            quantity: 1,
          },
        },
        {
          sectionId: "Section 2",
          value: {
            productId: "product-4",
            quantity: 2,
          },
        },
        {
          sectionId: "Section 3",
          value: {
            productId: "product-5",
            quantity: 1,
          },
        },
      ]);

      expect(composable.selectedConfiguration.value).toEqual({
        "Section 1": {
          productId: "product-2",
          quantity: 1,
          selectedProductTitle: "Product 2",
        },
        "Section 2": {
          productId: "product-4",
          quantity: 2,
          selectedProductTitle: "Product 4",
        },
        "Section 3": {
          productId: "product-5",
          quantity: 1,
          selectedProductTitle: "Product 5",
        },
      });
    });

    it("should handle invalid preselected values", async () => {
      const mockConfiguration = {
        configurationSections: [
          createConfigurationSection(1, { isRequired: true, products: [1, 2] }),
          createConfigurationSection(2, { isRequired: false, products: [3, 4] }),
        ],
      };
      mocks.getProductConfiguration.mockResolvedValue(mockConfiguration);

      mocks.getConfigurationItems.mockResolvedValue({
        configurationItems: [
          {
            sectionId: "Section 1",
            productId: "product-1",
            quantity: 1,
          },
          {
            sectionId: "Section 2",
            productId: "product-invalid",
            quantity: 2,
          },
        ],
      });

      mocks.getUrlSearchParamMock.mockReturnValue("line-item-111");

      await composable.fetchProductConfiguration();
      vi.advanceTimersByTime(TIMER_DELAY);
      await flushPromises();

      expect(mocks.getConfigurationItems).toHaveBeenCalledWith("line-item-111", "cart-id-1");

      expect(composable.selectedConfigurationInput.value).toEqual([
        {
          sectionId: "Section 1",
          value: {
            productId: "product-1",
            quantity: 1,
          },
        },
      ]);

      expect(composable.selectedConfiguration.value).toEqual({
        "Section 1": {
          productId: "product-1",
          quantity: 1,
          selectedProductTitle: "Product 1",
        },
        "Section 2": undefined,
      });
    });
  });

  describe("isConfigurationChanged", () => {
    it("should be set to true when selectedConfigurationInput changes", async () => {
      const mockConfiguration = {
        configurationSections: [createConfigurationSection(1), createConfigurationSection(2)],
      };
      mocks.getProductConfiguration.mockResolvedValue(mockConfiguration);

      await composable.fetchProductConfiguration();
      await flushPromises();

      expect(composable.isConfigurationChanged.value).toBe(false);

      composable.selectSectionValue({
        sectionId: "Section 1",
        value: {
          productId: "product-2",
          quantity: 1,
        },
      });

      expect(composable.isConfigurationChanged.value).toBe(true);
    });

    it("should be set to false when return to initially selected configuration", async () => {
      const mockConfiguration = {
        configurationSections: [createConfigurationSection(1), createConfigurationSection(2)],
      };
      mocks.getProductConfiguration.mockResolvedValue(mockConfiguration);

      await composable.fetchProductConfiguration();
      await flushPromises();

      expect(composable.isConfigurationChanged.value).toBe(false);

      // Change configuration
      composable.selectSectionValue({
        sectionId: "Section 1",
        value: {
          productId: "product-2",
          quantity: 1,
        },
      });

      expect(composable.isConfigurationChanged.value).toBe(true);

      // Return to initial configuration
      composable.selectSectionValue({
        sectionId: "Section 1",
        value: {
          productId: "product-1",
          quantity: 1,
        },
      });

      expect(composable.isConfigurationChanged.value).toBe(false);
    });

    it("should remain false when nothing is selected", async () => {
      const mockConfiguration = {
        configurationSections: [createConfigurationSection(1, { isRequired: false }), createConfigurationSection(2)],
      };
      mocks.getProductConfiguration.mockResolvedValue(mockConfiguration);

      await composable.fetchProductConfiguration();
      await flushPromises();

      expect(composable.isConfigurationChanged.value).toBe(false);
    });
  });
});

// Mock data factory functions
function createProduct(id: number) {
  return {
    id: `product-${id}`,
    name: `Product ${id}`,
  };
}

function createConfigurationSection(
  id: number,
  { isRequired = false, products = [1, 2] }: { isRequired?: boolean; products?: number[] } = {},
) {
  return {
    id: `Section ${id}`,
    name: `Section ${id}`,
    type: "product",
    isRequired,
    options: products.map((productId) => ({
      id: `option-${productId}`,
      product: createProduct(productId),
      quantity: 1,
    })),
  };
}
