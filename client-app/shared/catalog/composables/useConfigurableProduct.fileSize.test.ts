import { describe, it, expect, beforeEach, beforeAll, afterEach, vi } from "vitest";
import { ref } from "vue";
import { CreateConfiguredLineItemDocument } from "@/core/api/graphql/types";
import { useConfigurableProduct } from "@/shared/catalog/composables/useConfigurableProduct";
import { CONFIGURABLE_SECTION_TYPES } from "@/shared/catalog/constants/configurableProducts";
import type { useMutation } from "@vue/apollo-composable";

const REQUIRED_SECTION_ERROR = "shared.catalog.product_details.product_configuration.required_section";

const mocks = vi.hoisted(() => ({
  getProductConfiguration: vi.fn(),
  getConfigurationItems: vi.fn(),
  useMutationMock: vi.fn<typeof useMutation>(),
  getUrlSearchParamMock: vi.fn(),
  useShortCartMock: vi.fn(),
}));

vi.mock("@vue/apollo-composable", async () => {
  const actual = await vi.importActual<typeof import("@vue/apollo-composable")>("@vue/apollo-composable");
  return {
    ...actual,
    useMutation: (...args: Parameters<typeof actual.useMutation>) => {
      if (args[0] === CreateConfiguredLineItemDocument) {
        return mocks.useMutationMock(...args);
      }
      return actual.useMutation(...args);
    },
  };
});

vi.mock("@/core/api/graphql", async () => {
  const actual = await vi.importActual<typeof import("@/core/api/graphql")>("@/core/api/graphql");
  return {
    ...actual,
    getProductConfiguration: mocks.getProductConfiguration,
    getConfigurationItems: mocks.getConfigurationItems,
  };
});

vi.mock("@/core/utilities", async (importOriginal) => ({
  ...(await importOriginal()),
  Logger: { error: vi.fn(), debug: vi.fn() },
  getUrlSearchParam: mocks.getUrlSearchParamMock,
}));

vi.mock("@/shared/cart/composables", async () => {
  const actual = await vi.importActual<typeof import("@/shared/cart/composables")>("@/shared/cart/composables");
  return { ...actual, useShortCart: mocks.useShortCartMock };
});

/**
 * VCST-6000 — a genuinely 0-byte file must NOT satisfy a REQUIRED File section.
 * Mirrors the sibling Text section rule, which already requires non-empty content.
 */
describe("useConfigurableProduct — required File section rejects 0-byte files (VCST-6000)", () => {
  let productIdSeed = 0;

  beforeAll(() => {
    mockI18n();
    mocks.useMutationMock.mockReturnValue({
      mutate: vi.fn(),
      loading: ref(false),
      error: ref(null),
      called: ref(false),
      onDone: vi.fn(),
      onError: vi.fn(),
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mocks.getUrlSearchParamMock.mockReturnValue(null);
    mocks.useShortCartMock.mockReturnValue({ cart: ref({ id: "cart-id-1", items: [] }) });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function setup(isRequired: boolean) {
    productIdSeed++;
    mocks.getProductConfiguration.mockResolvedValue({
      configurationSections: [
        {
          id: "file_section_1",
          name: "File Section 1",
          type: CONFIGURABLE_SECTION_TYPES.file,
          isRequired,
          options: [],
        },
      ],
    });
    mocks.getConfigurationItems.mockResolvedValue({ configurationItems: [] });

    const composable = useConfigurableProduct(`vcst-6000-product-${productIdSeed}`);
    await composable.fetchProductConfiguration();
    return composable;
  }

  function selectFiles(
    composable: Awaited<ReturnType<typeof setup>>,
    files: { name: string; url: string; size: number; contentType: string }[],
  ) {
    composable.selectSectionValue({
      sectionId: "file_section_1",
      type: CONFIGURABLE_SECTION_TYPES.file,
      files,
      productId: undefined,
      quantity: undefined,
    });
  }

  const emptyFile = { name: "empty.pdf", url: "empty-url", size: 0, contentType: "application/pdf" };
  const realFile = { name: "real.pdf", url: "real-url", size: 1024, contentType: "application/pdf" };

  it("marks a required file section holding only a 0-byte file as INVALID", async () => {
    const composable = await setup(true);

    selectFiles(composable, [emptyFile]);

    expect(composable.validateSections()).toBe(false);
    expect(composable.validationErrors.value.get("file_section_1")).toBe(REQUIRED_SECTION_ERROR);
  });

  it("keeps add-to-cart blocked (isRequiredConfigurationComplete === false) for a 0-byte file", async () => {
    const composable = await setup(true);

    selectFiles(composable, [emptyFile]);

    expect(composable.isRequiredConfigurationComplete.value).toBe(false);
  });

  it("accepts a required file section holding one non-empty file", async () => {
    const composable = await setup(true);

    selectFiles(composable, [realFile]);

    expect(composable.validateSections()).toBe(true);
    expect(composable.validationErrors.value.size).toBe(0);
    expect(composable.isRequiredConfigurationComplete.value).toBe(true);
  });

  it("accepts a required file section when a 0-byte file sits alongside a non-empty one", async () => {
    const composable = await setup(true);

    selectFiles(composable, [emptyFile, realFile]);

    expect(composable.validateSections()).toBe(true);
    expect(composable.validationErrors.value.size).toBe(0);
    expect(composable.isRequiredConfigurationComplete.value).toBe(true);
  });

  it("leaves an OPTIONAL file section with only a 0-byte file valid", async () => {
    const composable = await setup(false);

    selectFiles(composable, [emptyFile]);

    expect(composable.validateSections()).toBe(true);
    expect(composable.validationErrors.value.size).toBe(0);
    expect(composable.isRequiredConfigurationComplete.value).toBe(true);
  });

  it("still rejects a required file section with no files at all", async () => {
    const composable = await setup(true);

    expect(composable.validateSections()).toBe(false);
    expect(composable.validationErrors.value.get("file_section_1")).toBe(REQUIRED_SECTION_ERROR);
    expect(composable.isRequiredConfigurationComplete.value).toBe(false);
  });
});

function mockI18n(): void {
  vi.mock("vue-i18n", () => {
    return {
      useI18n: vi.fn().mockReturnValue({
        t: (key: string) => key,
        te: () => true,
      }),
    };
  });
}
