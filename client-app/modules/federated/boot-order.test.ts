import { describe, expect, it, vi } from "vitest";

/**
 * Executes the real app-runner and records the order its calls actually happen in, so a call moved
 * into a callback or a branch is caught too — not just a moved line. The loader mock throws, which
 * ends the run at the only point this test cares about, so nothing past it needs mocking.
 *
 * The invariant: plugins resolve store settings through the facade's useModuleSettings, and the
 * permission gate reads user.value at call time, so both must be in place before the loader starts.
 */

const order: string[] = [];
const record = (name: string) =>
  vi.fn(() => {
    order.push(name);
  });

const LOADER_REACHED = new Error("loader reached - nothing past this point is under test");

const ref = <T>(value: T) => ({ value });

vi.mock("@/modules/federated/bootstrap", () => ({
  startFederatedModules: vi.fn(() => {
    order.push("startFederatedModules");
    throw LOADER_REACHED;
  }),
}));

vi.mock("@/shared/account", () => ({
  useUser: () => ({
    setUser: record("setUser"),
    user: ref({ id: "u1", userName: "u", contact: { organizationId: "o" } }),
    isAuthenticated: ref(false),
    savedUserId: ref(undefined),
    checkPermissions: vi.fn(() => true),
  }),
}));

const LANGUAGES = {
  currentLanguage: ref({ cultureName: "en-US" }),
  currentMaybeShortLocale: ref("en"),
  defaultStoreCulture: ref("en-US"),
  supportedLanguages: ref([{ cultureName: "en-US", twoLetterLanguageName: "en" }]),
  applyLocale: vi.fn(),
  fetchLocaleMessages: vi.fn(async () => ({})),
  mergeLocalesMessages: vi.fn(),
  resolveLocale: vi.fn(() => "en-US"),
  normalizeToSupportedCulture: vi.fn(() => "en-US"),
  getUrlWithoutPossibleLocale: vi.fn((path: string) => path),
  resolvePossibleLocale: vi.fn(() => undefined),
};
vi.mock("@/core/composables/useLanguages", () => ({ useLanguages: () => LANGUAGES }));

vi.mock("@/router", () => ({ createRouter: () => ({ addRoute: vi.fn(), beforeEach: vi.fn() }) }));
vi.mock("./App.vue", () => ({ default: {} }));
vi.mock("@/App.vue", () => ({ default: {} }));
vi.mock("@/ui-kit", () => ({ uiKit: { install: vi.fn() } }));
vi.mock("@/ui-kit/utilities", () => ({ setDefaultIconVariant: vi.fn() }));
vi.mock("@/ui-kit/utilities/getLocales", () => ({
  getLocales: vi.fn(async () => ({ messages: {}, fallbackMessages: {} })),
}));
vi.mock("@/i18n", () => ({ createI18n: () => ({ global: { t: (k: string) => k } }) }));
// Always a factory, never a bare vi.mock(path): a bare automock imports the real module to derive
// its shape, which drags in the very graph — router pages, App.vue, ui-kit — these mocks avoid.
// `app.use(authPlugin)` runs before the loader, so a plugin mock needs a real install() or Vue warns.
const vuePlugin = () => ({ install: vi.fn() });
vi.mock("@/core/plugins", () => ({
  applicationInsightsPlugin: vuePlugin(),
  authPlugin: vuePlugin(),
  configPlugin: vuePlugin(),
  contextPlugin: vuePlugin(),
  extensionPointsPlugin: vuePlugin(),
  permissionsPlugin: vuePlugin(),
}));
vi.mock("@/core/globals", () => ({ setGlobals: vi.fn(), globals: {} }));
vi.mock("@/core/locale-loaders", () => ({ registerLocaleLoader: vi.fn() }));
vi.mock("@/shared/catalog/components/product", () => ({ default: {} }));
vi.mock("@/shared/static-content", () => ({ templateBlocks: {} }));
vi.mock("@/core/api/graphql/types", () => ({ GetSlugInfoDocument: {} }));
vi.mock("@/core/utilities", () => ({
  extractHostname: vi.fn(() => "example.test"),
  Logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
vi.mock("@/modules/back-in-stock", () => ({ init: vi.fn() }));
vi.mock("@/modules/customer-reviews", () => ({ init: vi.fn() }));
vi.mock("@/modules/google-analytics", () => ({ init: vi.fn() }));
vi.mock("@/modules/loyalty", () => ({ init: vi.fn() }));
vi.mock("@/modules/news", () => ({ init: vi.fn() }));
vi.mock("@/modules/purchase-requests", () => ({ initialize: vi.fn() }));
vi.mock("@/modules/push-messages", () => ({ init: vi.fn() }));
vi.mock("@/modules/quotes", () => ({ init: vi.fn() }));
vi.mock("@/modules/sales-rep", () => ({ init: vi.fn() }));
vi.mock("@/plugins/builder-io-preview/utils", () => ({ isPreviewMode: () => false }));
vi.mock("@/plugins/builder-preview/utils", () => ({ getPreviewBootOptions: () => ({ isActive: false }) }));
vi.mock("@/pages/matcher/builderIo/console-ignored-errors", () => ({
  BUILDER_IO_TRACE_MARKER: "x",
  consoleIgnoredErrors: [],
}));
vi.mock("@/router/routes/ucp-handoff", () => ({ applyUcpHandoffBuyer: vi.fn(), restoreUcpHandoffCart: vi.fn() }));

vi.mock("@/core/composables", () => ({
  useThemeContext: () => ({
    themeContext: ref({
      storeId: "s",
      catalogId: "c",
      settings: { icon_variant: "outline" },
      storeSettings: { anonymousUsersAllowed: true },
      defaultPresetName: "d",
      activePresetName: "a",
    }),
    addPresetToThemeContext: vi.fn(),
    setThemeContext: record("setThemeContext"),
  }),
  useCurrency: () => ({ currentCurrency: ref({ code: "USD" }) }),
  useNavigations: () => ({ fetchCatalogMenu: vi.fn() }),
  useWhiteLabeling: () => ({ themePresetName: ref("p"), setWhiteLabelingSettings: vi.fn() }),
  useDarkMode: () => ({ setActivePreset: vi.fn() }),
  useModules: () => ({ setModules: record("setModules"), outdatedModules: ref([]) }),
}));

vi.mock("@/core/composables/useHotjar", () => ({ useHotjar: () => ({ init: vi.fn() }) }));

vi.mock("@/shared/notification", () => ({ useNotifications: () => ({ error: vi.fn(), success: vi.fn() }) }));

vi.mock("@/core/api/graphql", () => ({
  apolloClient: {},
  getPageContext: vi.fn(async () => ({
    store: { storeId: "s" },
    user: { id: "u1" },
    whiteLabelingSettings: {},
    slugInfo: undefined,
  })),
  getStorePlugins: vi.fn(async () => []),
  initializeApplication: vi.fn(async () => ({ settings: { modules: [] } })),
}));

describe("app-runner boot order", () => {
  it("has the theme context and the user in place before the loader starts", async () => {
    document.body.innerHTML = '<div id="app"></div>';
    const runner = (await import("@/app-runner")).default;

    await expect(runner()).rejects.toThrow("loader reached");

    // Only what the loader actually depends on: both are in place before it starts. Their order
    // relative to each other is not part of the contract.
    const loaderAt = order.indexOf("startFederatedModules");
    expect(loaderAt, `loader never ran; order was ${order.join(" -> ")}`).toBeGreaterThan(-1);
    expect(order.indexOf("setThemeContext"), "setThemeContext did not run before the loader").toBeGreaterThan(-1);
    expect(order.indexOf("setThemeContext")).toBeLessThan(loaderAt);
    expect(order.indexOf("setUser"), "setUser did not run before the loader").toBeGreaterThan(-1);
    expect(order.indexOf("setUser")).toBeLessThan(loaderAt);
  });
});
