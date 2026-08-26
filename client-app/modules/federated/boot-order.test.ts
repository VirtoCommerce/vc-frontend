import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { IPlatformPlugin } from "./index";

/**
 * Executes the real app-runner and records the order its calls actually happen in, so a call moved
 * into a callback or a branch is caught too — not just a moved line.
 *
 * MAINTENANCE: a module added to app-runner needs a mock added below, or every case here fails with
 * whatever that module breaks first - "Theme context is missing." - which points nowhere near it.
 *
 * Three invariants, all load-bearing. Plugins resolve store settings through the facade's
 * useModuleSettings and the permission gate reads user.value at call time, so setThemeContext and
 * setUser must precede the loader. And the router must not be installed until the loader settles,
 * or a deep link to a plugin route resolves before the plugin registered it.
 */

const order: string[] = [];
const record = (name: string) =>
  vi.fn(() => {
    order.push(name);
  });

const LOADER_REACHED = new Error("loader reached - nothing past this point is under test");

const { getStorePluginsMock, loaderOptions, previewBoot } = vi.hoisted(() => {
  // The options app-runner hands the loader, so the discovery wiring itself is assertable.
  const captured: { current?: { fetchPlugins?: () => Promise<unknown> } } = {};
  return {
    getStorePluginsMock: vi.fn(),
    loaderOptions: captured,
    previewBoot: { isActive: false },
  };
});

const ref = <T>(value: T) => ({ value });

// Rejects rather than throwing at the call site: the run must reach `await federatedModulesReady`
// for the rejection to surface, so deleting that await turns this into an unhandled rejection and
// the assertion below stops seeing a rejected run.
vi.mock("@/modules/federated/bootstrap", () => ({
  startFederatedModules: vi.fn(async (options?: { fetchPlugins?: () => Promise<unknown> }) => {
    order.push("startFederatedModules");
    loaderOptions.current = options;
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

// `install` is what `app.use(router)` calls, so it doubles as the recorder for the router install.
vi.mock("@/router", () => ({
  createRouter: () => ({
    addRoute: vi.fn(),
    beforeEach: vi.fn(),
    isReady: vi.fn(async () => undefined),
    install: () => {
      order.push("app.use(router)");
    },
  }),
}));
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
vi.mock("@/plugins/builder-preview/utils", () => ({ getPreviewBootOptions: () => previewBoot }));
// Imported by app-runner in preview mode; its install() is where the host mutates routes.
vi.mock("@/plugins/builder-preview/builder-preview.plugin", () => ({
  default: { install: record("builderPreview.install") },
}));
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
  getPageContext: vi.fn(async () => {
    order.push("getPageContext");
    return {
      store: { storeId: "s" },
      user: { id: "u1" },
      whiteLabelingSettings: {},
      slugInfo: undefined,
    };
  }),
  getStorePlugins: getStorePluginsMock,
  initializeApplication: vi.fn(async () => ({ settings: { modules: [] } })),
}));

/** Each case runs the real app-runner again, so nothing may carry over between them. */
async function runBoot() {
  document.body.innerHTML = '<div id="app"></div>';
  const runner = (await import("@/app-runner")).default;
  await expect(runner()).rejects.toThrow("loader reached");
}

describe("app-runner boot order", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    // Shared across cases: without this a later case reads an earlier one's recording and can
    // pass on entries its own run never produced.
    order.length = 0;
    loaderOptions.current = undefined;
    previewBoot.isActive = false;
    getStorePluginsMock.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("puts the theme context and the user in place before the loader, and the router after it", async () => {
    await runBoot();

    // The router must not be installed until the loader has settled, or a deep link to a plugin
    // route resolves before the plugin registered it.
    expect(order, `order was ${order.join(" -> ")}`).not.toContain("app.use(router)");

    // Only what the loader actually depends on: both are in place before it starts. Their order
    // relative to each other is not part of the contract.
    const loaderAt = order.indexOf("startFederatedModules");
    expect(loaderAt, `loader never ran; order was ${order.join(" -> ")}`).toBeGreaterThan(-1);
    expect(order.indexOf("setThemeContext"), "setThemeContext did not run before the loader").toBeGreaterThan(-1);
    expect(order.indexOf("setThemeContext")).toBeLessThan(loaderAt);
    expect(order.indexOf("setUser"), "setUser did not run before the loader").toBeGreaterThan(-1);
    expect(order.indexOf("setUser")).toBeLessThan(loaderAt);
  });
  describe("discovery wiring", () => {
    const PLUGINS = [{ id: "sales-rep" }] as unknown as readonly IPlatformPlugin[];

    it("issues the plugin-list query and hands its result to the loader when the flag is on", async () => {
      vi.stubEnv("APP_MODULES_FEDERATION_ENABLED", "true");
      getStorePluginsMock.mockResolvedValue(PLUGINS);

      await runBoot();

      // Not just "the query ran": the promise it returned must be what reaches the loader, which
      // is the wiring a deleted call site would break while every loader spec stayed green.
      expect(getStorePluginsMock).toHaveBeenCalledTimes(1);
      await expect(loaderOptions.current?.fetchPlugins?.()).resolves.toBe(PLUGINS);
    });

    it("issues nothing and resolves to no plugins when the flag is off", async () => {
      await runBoot();

      expect(getStorePluginsMock).not.toHaveBeenCalled();
      await expect(loaderOptions.current?.fetchPlugins?.()).resolves.toBeUndefined();
    });

    it("starts the query before it awaits the page context, so the round trips overlap", async () => {
      vi.stubEnv("APP_MODULES_FEDERATION_ENABLED", "true");
      getStorePluginsMock.mockImplementation(() => {
        order.push("getStorePlugins");
        return Promise.resolve([]);
      });

      await runBoot();

      // Against the page context, not the loader: a later call site still precedes the loader, so
      // comparing with that one passes wherever the query is issued.
      expect(order.indexOf("getPageContext"), `order was ${order.join(" -> ")}`).toBeGreaterThan(-1);
      expect(order.indexOf("getStorePlugins")).toBeGreaterThan(-1);
      expect(order.indexOf("getStorePlugins")).toBeLessThan(order.indexOf("getPageContext"));
    });

    it("issues nothing when the env override is set, since that list wins anyway", async () => {
      vi.stubEnv("APP_MODULES_FEDERATION_ENABLED", "true");
      vi.stubEnv("APP_MODULES_FEDERATION_REMOTES", '{"local":"http://localhost:3001/mf-manifest.json"}');

      await runBoot();

      expect(getStorePluginsMock).not.toHaveBeenCalled();
      await expect(loaderOptions.current?.fetchPlugins?.()).resolves.toBeUndefined();
    });
  });

  it("starts the loader only after the host plugin that mutates routes has installed", async () => {
    // The loader's route guard cannot tell a host call from a plugin's, so a host install running
    // inside its phase has its own routes refused.
    vi.stubEnv("APP_MODULES_FEDERATION_ENABLED", "true");
    previewBoot.isActive = true;

    await runBoot();

    const installedAt = order.indexOf("builderPreview.install");
    expect(installedAt, `preview plugin never installed; order was ${order.join(" -> ")}`).toBeGreaterThan(-1);
    expect(installedAt).toBeLessThan(order.indexOf("startFederatedModules"));
  });
});
