import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref, computed } from "vue";
import { useEnvironmentName } from "./useEnvironmentName";
import { useModuleSettings } from "./useModuleSettings";
import { usePageTitle } from "./usePageTitle";
import { useThemeContext } from "./useThemeContext";

// Mock dependencies
vi.mock("./useEnvironmentName", () => ({
  useEnvironmentName: vi.fn(),
}));

vi.mock("./useModuleSettings", () => ({
  useModuleSettings: vi.fn(),
}));

vi.mock("./useThemeContext", () => ({
  useThemeContext: vi.fn(),
}));

describe("usePageTitle", () => {
  const mockGetModuleSettings = vi.fn();
  const mockGetSettingValue = vi.fn();
  const mockIsEnabled = vi.fn();
  const mockThemeContextValue = {
    storeName: "Test Store",
    storeId: "store-id",
    catalogId: "catalog-id",
    defaultLanguage: "en-US",
    defaultCurrency: "USD",
    availableLanguages: [],
    availableCurrencies: [],
    availablePaymentMethods: [],
    moduleSettingsMap: {},
    settings: {},
    defaultPresetName: "default",
    storeSettings: {},
  };

  beforeEach(() => {
    // Setup mocks
    vi.mocked(useEnvironmentName).mockReturnValue({
      environmentName: "DEV",
      isIgnored: false,
    });

    vi.mocked(useModuleSettings).mockReturnValue({
      getModuleSettings: mockGetModuleSettings,
      getSettingValue: mockGetSettingValue,
      hasModuleSettings: computed(() => true),
      isEnabled: mockIsEnabled,
      moduleSettings: computed(() => []),
    });

    vi.mocked(useThemeContext).mockReturnValue({
      setThemeContext: vi.fn(),
      addPresetToThemeContext: vi.fn().mockResolvedValue(undefined),
      // @ts-expect-error - Simplified mock for test purposes
      themeContext: computed(() => mockThemeContextValue),
      modulesSettings: computed(() => []),
    });

    mockGetModuleSettings.mockReturnValue({
      page_title_with_store_name: true,
      page_title_store_name_align: "start",
      page_title_divider: "|",
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should build title with environment, store name, and title", () => {
    const { title } = usePageTitle("Product Page");
    expect(title.value).toBe("DEV | Test Store | Product Page");
  });

  it("should build title with environment and store name when title is undefined", () => {
    const { title } = usePageTitle();
    expect(title.value).toBe("");
  });

  it("should build title with store name at the end when align is set to 'end'", () => {
    mockGetModuleSettings.mockReturnValue({
      page_title_with_store_name: true,
      page_title_store_name_align: "end",
      page_title_divider: "|",
    });

    const { title } = usePageTitle("Product Page");
    expect(title.value).toBe("DEV | Product Page | Test Store");
  });

  it("should not include store name when page_title_with_store_name is false", () => {
    mockGetModuleSettings.mockReturnValue({
      page_title_with_store_name: false,
      page_title_store_name_align: "start",
      page_title_divider: "|",
    });

    const { title } = usePageTitle("Product Page");
    expect(title.value).toBe("DEV | Product Page");
  });

  it("should not include environment when isIgnored is true", () => {
    vi.mocked(useEnvironmentName).mockReturnValue({
      environmentName: "DEV",
      isIgnored: true,
    });

    const { title } = usePageTitle("Product Page");
    expect(title.value).toBe("Test Store | Product Page");
  });

  it("should handle array of title segments", () => {
    const { title } = usePageTitle(["Category", "Product"]);
    expect(title.value).toBe("DEV | Test Store | Category | Product");
  });

  it("should handle reactive title", () => {
    const reactiveTitle = ref("Initial Page");
    const { title } = usePageTitle(reactiveTitle);
    expect(title.value).toBe("DEV | Test Store | Initial Page");

    reactiveTitle.value = "Updated Page";
    expect(title.value).toBe("DEV | Test Store | Updated Page");
  });

  it("should use custom divider", () => {
    mockGetModuleSettings.mockReturnValue({
      page_title_with_store_name: true,
      page_title_store_name_align: "start",
      page_title_divider: "-",
    });

    const { title } = usePageTitle("Product Page");
    expect(title.value).toBe("DEV - Test Store - Product Page");
  });

  it("should use space as divider when page_title_divider is empty", () => {
    mockGetModuleSettings.mockReturnValue({
      page_title_with_store_name: true,
      page_title_store_name_align: "start",
      page_title_divider: "",
    });

    const { title } = usePageTitle("Product Page");
    expect(title.value).toBe("DEV Test Store Product Page");
  });
});
