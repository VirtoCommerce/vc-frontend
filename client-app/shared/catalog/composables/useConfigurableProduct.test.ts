import { flushPromises } from "@vue/test-utils";
import { describe, it, expect, beforeEach, beforeAll, afterEach, vi } from "vitest";
import { ref } from "vue";
import { CartConfigurationItemEnumType } from "@/core/api/graphql/types";
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
  Logger: { error: vi.fn(), debug: vi.fn() },
  getUrlSearchParam: mocks.getUrlSearchParamMock,
}));

vi.mock("@/shared/cart/composables", async () => {
  const actual = await vi.importActual<typeof import("@/shared/cart/composables")>("@/shared/cart/composables");
  return { ...actual, useShortCart: mocks.useShortCartMock };
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

  describe("product type configuration", () => {
    beforeEach(() => {
      mocks.getUrlSearchParamMock.mockReturnValue(null);
      mocks.useShortCartMock.mockReturnValue({ cart: ref({ id: "cart-id-1", items: [] }) });
      composable = useConfigurableProduct(configurableProductId);
    });

    it("initializes with correct default state", () => {
      expect(composable.configuration.value).toEqual([]);
      expect(composable.selectedConfiguration.value).toEqual({});
      expect(composable.selectedConfigurationInput.value).toEqual([]);
      expect(composable.configuredLineItem.value).toBeUndefined();
      expect(composable.loading.value).toBe(false);
    });

    it("fetches product configuration and sets configuration ref", async () => {
      const mockConfiguration = {
        configurationSections: [createConfigurationSection(1, { isRequired: true }), createConfigurationSection(2)],
      };
      mocks.getProductConfiguration.mockResolvedValue(mockConfiguration);
      await composable.fetchProductConfiguration();

      expect(mocks.getProductConfiguration).toHaveBeenCalledWith(configurableProductId);
      expect(mocks.getConfigurationItems).not.toHaveBeenCalled();
      expect(composable.configuration.value).toEqual(mockConfiguration.configurationSections);
      expect(composable.selectedConfiguration.value).toEqual({
        section_1: {
          productId: "product-1",
          quantity: 1,
          selectedOptionTextValue: "Product 1",
        },
      });
    });

    it("updates selectedConfiguration when selectSectionValue is called", async () => {
      const mockConfiguration = {
        configurationSections: [
          createConfigurationSection(1, { isRequired: true, products: [1, 2] }),
          createConfigurationSection(2, { isRequired: false, products: [3, 4] }),
        ],
      };
      mocks.getProductConfiguration.mockResolvedValue(mockConfiguration);
      await composable.fetchProductConfiguration();

      composable.selectSectionValue({
        sectionId: "section_2",
        option: { productId: "product-3", quantity: 1 },
        type: CartConfigurationItemEnumType.Product,
        customText: undefined,
      });

      expect(composable.selectedConfiguration.value).toEqual({
        section_1: {
          productId: "product-1",
          quantity: 1,
          selectedOptionTextValue: "Product 1",
        },
        section_2: {
          productId: "product-3",
          quantity: 1,
          selectedOptionTextValue: "Product 3",
        },
      });
    });

    it("calls createConfiguredLineItem when selectedConfigurationInput changes", async () => {
      const mockConfiguration = {
        configurationSections: [createConfigurationSection(1, { isRequired: false })],
      };
      mocks.getProductConfiguration.mockResolvedValue(mockConfiguration);
      const mockResponse = { data: { createConfiguredLineItem: { id: "configured-line-item-1" } } };
      createConfiguredLineItemMutationMock.mockResolvedValue(mockResponse);

      await composable.fetchProductConfiguration();
      vi.advanceTimersByTime(TIMER_DELAY);
      await flushPromises();

      composable.selectSectionValue({
        sectionId: "section_1",
        option: { productId: "product-2", quantity: 1 },
        type: CartConfigurationItemEnumType.Product,
        customText: undefined,
      });
      await flushPromises();
      vi.advanceTimersByTime(TIMER_DELAY);

      expect(createConfiguredLineItemMutationMock).toBeCalledTimes(2);
      const [firstCall] = createConfiguredLineItemMutationMock.mock.calls[0] as [
        CreateConfiguredLineItemMutationVariables,
      ];
      const [secondCall] = createConfiguredLineItemMutationMock.mock.calls[1] as [
        CreateConfiguredLineItemMutationVariables,
      ];

      expect(firstCall).toEqual({
        command: { configurableProductId, configurationSections: [] },
      });
      expect(secondCall).toEqual({
        command: {
          configurableProductId,
          configurationSections: [
            {
              sectionId: "section_1",
              option: { productId: "product-2", quantity: 1 },
              type: CartConfigurationItemEnumType.Product,
            },
          ],
        },
      });
      expect(composable.configuredLineItem.value).toEqual(mockResponse.data.createConfiguredLineItem);
    });

    it("sets loading to true while fetching or creating", async () => {
      const mockConfiguration = { configurationSections: [] };
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
        sectionId: "section_1",
        option: { productId: "product-1", quantity: 1 },
        type: CartConfigurationItemEnumType.Product,
        customText: undefined,
      });
      await flushPromises();
      vi.advanceTimersByTime(TIMER_DELAY);
      await flushPromises();

      expect(composable.loading.value).toBe(false);
    });

    it("does not call createConfiguredLineItem if input does not change", async () => {
      const mockConfiguration = { configurationSections: [createConfigurationSection(1)] };
      mocks.getProductConfiguration.mockResolvedValue(mockConfiguration);
      await composable.fetchProductConfiguration();
      vi.advanceTimersByTime(TIMER_DELAY);

      composable.selectSectionValue({
        sectionId: "section_1",
        option: { productId: "product-1", quantity: 1 },
        type: CartConfigurationItemEnumType.Product,
        customText: undefined,
      });
      await flushPromises();

      expect(createConfiguredLineItemMutationMock).toBeCalledTimes(1);
    });
  });

  describe("text type configuration", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mocks.getUrlSearchParamMock.mockReturnValue("line-item-1");
      mocks.useShortCartMock.mockReturnValue({ cart: ref({ id: "cart-id-1" }) });
      composable = useConfigurableProduct(configurableProductId);
    });

    it("handles text type configuration with predefined value", async () => {
      const mockConfiguration = {
        configurationSections: [createTextConfigurationSection(1, { isRequired: true })],
      };
      mocks.getProductConfiguration.mockResolvedValue(mockConfiguration);
      mocks.getConfigurationItems.mockResolvedValue({
        configurationItems: [
          {
            sectionId: "text_section_1",
            type: CartConfigurationItemEnumType.Text,
            customText: "Predefined text",
          },
        ],
      });
      await composable.fetchProductConfiguration();

      expect(composable.selectedConfiguration.value).toEqual({
        text_section_1: {
          productId: undefined,
          quantity: undefined,
          selectedOptionTextValue: "Predefined text",
        },
      });
      expect(composable.selectedConfigurationInput.value).toEqual([
        {
          sectionId: "text_section_1",
          type: CartConfigurationItemEnumType.Text,
          customText: "Predefined text",
          option: undefined,
        },
      ]);
    });

    it("handles text type configuration selection", async () => {
      const mockConfiguration = {
        configurationSections: [
          createTextConfigurationSection(1, { isRequired: true }),
          createTextConfigurationSection(2, { isRequired: false }),
        ],
      };
      mocks.getProductConfiguration.mockResolvedValue(mockConfiguration);
      await composable.fetchProductConfiguration();

      composable.selectSectionValue({
        sectionId: "text_section_1",
        type: CartConfigurationItemEnumType.Text,
        customText: "Test text 1",
      });

      expect(composable.selectedConfiguration.value).toEqual({
        text_section_1: {
          productId: undefined,
          quantity: undefined,
          selectedOptionTextValue: "Test text 1",
        },
      });
    });

    it("updates selectedConfiguration when text is changed", async () => {
      const mockConfiguration = {
        configurationSections: [createTextConfigurationSection(1)],
      };
      mocks.getProductConfiguration.mockResolvedValue(mockConfiguration);
      await composable.fetchProductConfiguration();

      composable.selectSectionValue({
        sectionId: "text_section_1",
        type: CartConfigurationItemEnumType.Text,
        customText: "First text",
      });

      composable.selectSectionValue({
        sectionId: "text_section_1",
        type: CartConfigurationItemEnumType.Text,
        customText: "Updated text",
      });

      expect(composable.selectedConfiguration.value).toEqual({
        text_section_1: {
          productId: undefined,
          quantity: undefined,
          selectedOptionTextValue: "Updated text",
        },
      });
    });

    it("removes text configuration when empty text is provided", async () => {
      const mockConfiguration = {
        configurationSections: [createTextConfigurationSection(1)],
      };
      mocks.getProductConfiguration.mockResolvedValue(mockConfiguration);
      await composable.fetchProductConfiguration();

      composable.selectSectionValue({
        sectionId: "text_section_1",
        type: CartConfigurationItemEnumType.Text,
        customText: "Test text",
      });

      composable.selectSectionValue({
        sectionId: "text_section_1",
        type: CartConfigurationItemEnumType.Text,
        customText: "",
      });

      expect(composable.selectedConfiguration.value).toEqual({});
    });

    it("handles required text configuration with default empty value", async () => {
      const mockConfiguration = {
        configurationSections: [createTextConfigurationSection(1, { isRequired: true })],
      };
      mocks.getProductConfiguration.mockResolvedValue(mockConfiguration);
      mocks.getConfigurationItems.mockResolvedValue({ configurationItems: [] });

      await composable.fetchProductConfiguration();

      expect(composable.selectedConfiguration.value).toEqual({});
      expect(composable.selectedConfigurationInput.value).toEqual([]);
    });

    it("creates configured line item with text configuration", async () => {
      const mockConfiguration = {
        configurationSections: [createTextConfigurationSection(1)],
      };
      mocks.getProductConfiguration.mockResolvedValue(mockConfiguration);
      const mockResponse = { data: { createConfiguredLineItem: { id: "configured-line-item-1" } } };
      createConfiguredLineItemMutationMock.mockResolvedValue(mockResponse);

      await composable.fetchProductConfiguration();
      vi.advanceTimersByTime(TIMER_DELAY);
      await flushPromises();

      composable.selectSectionValue({
        sectionId: "text_section_1",
        type: CartConfigurationItemEnumType.Text,
        customText: "Test text",
      });
      await flushPromises();
      vi.advanceTimersByTime(TIMER_DELAY);

      expect(createConfiguredLineItemMutationMock).toBeCalledTimes(2);
      const [secondCall] = createConfiguredLineItemMutationMock.mock.calls[1] as [
        CreateConfiguredLineItemMutationVariables,
      ];

      expect(secondCall).toEqual({
        command: {
          configurableProductId,
          configurationSections: [
            {
              sectionId: "text_section_1",
              type: CartConfigurationItemEnumType.Text,
              customText: "Test text",
            },
          ],
        },
      });
    });
  });

  describe("common functionality", () => {
    beforeEach(() => {
      mocks.getUrlSearchParamMock.mockReturnValue(null);
      mocks.useShortCartMock.mockReturnValue({ cart: ref({ id: "cart-id-1", items: [] }) });
      composable = useConfigurableProduct(configurableProductId);
    });

    it("sets loading to true while fetching or creating", async () => {
      const mockConfiguration = { configurationSections: [] };
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
        sectionId: "section_1",
        option: { productId: "product-1", quantity: 1 },
        type: CartConfigurationItemEnumType.Product,
        customText: undefined,
      });
      await flushPromises();
      vi.advanceTimersByTime(TIMER_DELAY);
      await flushPromises();

      expect(composable.loading.value).toBe(false);
    });

    it("does not call createConfiguredLineItem if input does not change", async () => {
      const mockConfiguration = { configurationSections: [createConfigurationSection(1)] };
      mocks.getProductConfiguration.mockResolvedValue(mockConfiguration);
      await composable.fetchProductConfiguration();
      vi.advanceTimersByTime(TIMER_DELAY);

      composable.selectSectionValue({
        sectionId: "section_1",
        option: { productId: "product-1", quantity: 1 },
        type: CartConfigurationItemEnumType.Product,
        customText: undefined,
      });
      await flushPromises();

      expect(createConfiguredLineItemMutationMock).toBeCalledTimes(1);
    });

    describe("isConfigurationChanged", () => {
      it("returns true when selectedConfigurationInput changes", async () => {
        const mockConfiguration = {
          configurationSections: [createConfigurationSection(1), createConfigurationSection(2)],
        };
        mocks.getProductConfiguration.mockResolvedValue(mockConfiguration);
        await composable.fetchProductConfiguration();
        expect(composable.isConfigurationChanged.value).toBe(false);

        composable.selectSectionValue({
          customText: undefined,
          sectionId: "section_1",
          option: { productId: "product-2", quantity: 1 },
          type: CartConfigurationItemEnumType.Product,
        });
        expect(composable.isConfigurationChanged.value).toBe(true);
      });

      it("returns false when reverted to initial configuration", async () => {
        const mockConfiguration = {
          configurationSections: [createConfigurationSection(1, { isRequired: true }), createConfigurationSection(2)],
        };
        mocks.getProductConfiguration.mockResolvedValue(mockConfiguration);
        await composable.fetchProductConfiguration();
        expect(composable.isConfigurationChanged.value).toBe(false);

        composable.selectSectionValue({
          customText: undefined,
          sectionId: "section_1",
          option: { productId: "product-2", quantity: 1 },
          type: CartConfigurationItemEnumType.Product,
        });
        expect(composable.isConfigurationChanged.value).toBe(true);

        composable.selectSectionValue({
          customText: undefined,
          sectionId: "section_1",
          option: { productId: "product-1", quantity: 1 },
          type: CartConfigurationItemEnumType.Product,
        });
        expect(composable.isConfigurationChanged.value).toBe(false);
      });

      it("remains false when nothing is selected", async () => {
        const mockConfiguration = {
          configurationSections: [createConfigurationSection(1, { isRequired: false }), createConfigurationSection(2)],
        };
        mocks.getProductConfiguration.mockResolvedValue(mockConfiguration);
        await composable.fetchProductConfiguration();
        expect(composable.isConfigurationChanged.value).toBe(false);
      });
    });
  });
});

function createProduct(id: number) {
  return { id: `product-${id}`, name: `Product ${id}` };
}

function createConfigurationSection(
  id: number,
  { isRequired = false, products = [1, 2] }: { isRequired?: boolean; products?: number[] } = {},
) {
  return {
    id: `section_${id}`,
    name: `Section ${id}`,
    type: CartConfigurationItemEnumType.Product,
    isRequired,
    options: products.map((prodId) => ({
      id: `option_${prodId}`,
      product: createProduct(prodId),
      quantity: 1,
    })),
  };
}

function createTextConfigurationSection(id: number, { isRequired = false }: { isRequired?: boolean } = {}) {
  return {
    id: `text_section_${id}`,
    name: `Text Section ${id}`,
    type: CartConfigurationItemEnumType.Text,
    isRequired,
    options: [],
  };
}
