/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { flushPromises } from "@vue/test-utils";
import { describe, it, expect, beforeEach, vi, beforeAll } from "vitest";
import { useConfigurableProduct } from "@/shared/catalog/composables/useConfigurableProduct";
import type { Mock } from "vitest";

const mocks = vi.hoisted(() => {
  return {
    getProductConfiguration: vi.fn(),
    useCreateConfiguredLineItemMutation: vi.fn(),
  };
});

vi.mock("@/core/api/graphql/catalog", () => ({
  getProductConfiguration: mocks.getProductConfiguration,
  useCreateConfiguredLineItemMutation: mocks.useCreateConfiguredLineItemMutation,
}));

vi.mock("@/core/utilities", () => ({
  Logger: {
    error: vi.fn(),
  },
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({
    resolve: vi.fn().mockReturnValue({}),
    currentRoute: {
      value: {
        query: {},
      },
    },
  }),
}));

describe("useConfigurableProduct", () => {
  type UseConfigurableProductType =
    typeof import("@/shared/catalog/composables/useConfigurableProduct").useConfigurableProduct;

  let composable: ReturnType<UseConfigurableProductType>;
  const configurableProductId = "test-product-id";
  let createConfiguredLineItemMutationMock: Mock;

  beforeAll(() => {
    createConfiguredLineItemMutationMock = vi.fn();
    mocks.useCreateConfiguredLineItemMutation.mockReturnValue({ mutate: createConfiguredLineItemMutationMock });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

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
    expect(composable.configuration.value).toEqual(mockConfiguration.configurationSections);

    expect(composable.selectedConfiguration.value).toEqual({
      "Section 1": {
        productId: "product-1",
        quantity: 1,
        selectedProductTitle: "Product 1",
      },
      "Section 2": undefined,
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
    vi.advanceTimersByTime(1000);
    await flushPromises();

    composable.selectSectionValue({
      sectionId: "Section 1",
      value: {
        productId: "product-2",
        quantity: 1,
      },
    });

    await flushPromises();
    vi.advanceTimersByTime(1000);

    expect(createConfiguredLineItemMutationMock.mock.calls[0][0]).toEqual({
      command: {
        configurableProductId: configurableProductId,
        configurationSections: [],
      },
    });

    expect(createConfiguredLineItemMutationMock).toBeCalledTimes(2);
    expect(createConfiguredLineItemMutationMock.mock.calls[1][0]).toEqual({
      command: {
        configurableProductId: configurableProductId,
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
    vi.advanceTimersByTime(1000);
    await flushPromises();

    expect(composable.loading.value).toBe(false);
  });

  it("should not call createConfiguredLineItem if selectedConfigurationInput does not change", async () => {
    const mockConfiguration = {
      configurationSections: [createConfigurationSection(1)],
    };
    mocks.getProductConfiguration.mockResolvedValue(mockConfiguration);

    await composable.fetchProductConfiguration();
    vi.advanceTimersByTime(1000);
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

// Mock data factory functions
function createProduct(id: number) {
  return {
    id: `product-${id}`,
    name: `Product ${id}`,
  };
}
function createConfigurationSection(id: number, { isRequired = false, products = [1, 2] } = {}) {
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
