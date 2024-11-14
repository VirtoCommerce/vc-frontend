/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { flushPromises } from "@vue/test-utils";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useConfigurableProduct } from "@/shared/catalog";
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

describe("useConfigurableProduct", () => {
  let composable: ReturnType<typeof useConfigurableProduct>;
  const configurableProductId = "test-product-id";
  let mutateMock: Mock;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    useConfigurableProduct.clear();

    mutateMock = vi.fn();
    mocks.useCreateConfiguredLineItemMutation.mockReturnValue({ mutate: mutateMock });

    composable = useConfigurableProduct(configurableProductId);
  });

  it("should fetch product configuration and set configuration ref", async () => {
    const mockConfiguration = {
      configurationSections: [
        {
          id: "Section 1",
          name: "Section 1",
          isRequired: true,
          products: [
            { id: "product-1", name: "Product 1" },
            { id: "product-2", name: "Product 2" },
          ],
          quantity: 1,
        },
        {
          id: "Section 2",
          name: "Section 2",
          isRequired: false,
          products: [
            { id: "product-3", name: "Product 3" },
            { id: "product-4", name: "Product 4" },
          ],
          quantity: 1,
        },
      ],
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
        {
          id: "Section 1",
          name: "Section 1",
          isRequired: true,
          products: [
            { id: "product-1", name: "Product 1" },
            { id: "product-2", name: "Product 2" },
          ],
          quantity: 1,
        },
        {
          id: "Section 2",
          name: "Section 2",
          isRequired: false,
          products: [
            { id: "product-3", name: "Product 3" },
            { id: "product-4", name: "Product 4" },
          ],
          quantity: 1,
        },
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
      configurationSections: [
        {
          id: "Section 1",
          name: "Section 1",
          isRequired: false,
          products: [
            { id: "product-1", name: "Product 1" },
            { id: "product-2", name: "Product 2" },
          ],
          quantity: 1,
        },
      ],
    };

    mocks.getProductConfiguration.mockResolvedValue(mockConfiguration);

    const mockCreateConfiguredLineItemResponse = {
      data: {
        createConfiguredLineItem: {
          id: "configured-line-item-1", // just a mock data, in reality there is different structure
        },
      },
    };

    mutateMock.mockResolvedValue(mockCreateConfiguredLineItemResponse);

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

    expect(mutateMock.mock.calls[0][0]).toEqual({
      command: {
        configurableProductId: configurableProductId,
        configurationSections: [
          {
            sectionId: "Section 1",
            value: undefined,
          },
        ],
      },
    });

    expect(mutateMock).toBeCalledTimes(2);
    expect(mutateMock.mock.calls[1][0]).toEqual({
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
    expect(composable.loading.value).toBe(false);

    mutateMock.mockImplementation(() => {
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
});
