import { afterEach, describe, expect, it, vi } from "vitest";
import type { App, Plugin } from "vue";

// Exercises the REAL readiness machinery in getAppInsightsWhenReady (Promise.race +
// setTimeout + clearTimeout) and the install()-driven resolution, which the federated
// loader tests deliberately mock away. Module state (readyPromise, appInsightsInstance)
// is created once per import, so each test re-imports the module for a clean slate.

const { useModuleSettingsMock, appInsightsPluginInstallMock } = vi.hoisted(() => ({
  useModuleSettingsMock: vi.fn(),
  appInsightsPluginInstallMock: vi.fn(),
}));

vi.mock("../composables/useModuleSettings", () => ({
  useModuleSettings: useModuleSettingsMock,
}));

vi.mock("vue3-application-insights", () => ({
  AppInsightsPlugin: { install: appInsightsPluginInstallMock },
}));

function fakeApp(): App {
  const app = {
    use(plugin: { install: (app: unknown, options?: unknown) => void }, options?: unknown) {
      plugin.install(app, options);
      return app;
    },
  };
  return app as unknown as App;
}

// Vue types Plugin.install as optional (function plugins have none); this one is always
// an object plugin, so narrow before installing.
function installPlugin(plugin: Plugin): void {
  if (typeof plugin === "object" && plugin.install) {
    plugin.install(fakeApp());
  }
}

function stubSettings(enabled: boolean, instrumentationKey?: string): void {
  useModuleSettingsMock.mockReturnValue({
    isEnabled: () => enabled,
    getSettingValue: () => instrumentationKey,
  });
}

async function importFresh() {
  vi.resetModules();
  return import("./applicationInsights.plugin");
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("getAppInsightsWhenReady", () => {
  it("resolves with the instance once onLoaded fires during install", async () => {
    const instance = { trackException: vi.fn() };
    appInsightsPluginInstallMock.mockImplementation((_app, options) => options.onLoaded(instance));
    stubSettings(true, "instrumentation-key");

    const mod = await importFresh();
    installPlugin(mod.applicationInsightsPlugin);

    await expect(mod.getAppInsightsWhenReady(1000)).resolves.toBe(instance);
    expect(mod.getAppInsights()).toBe(instance);
  });

  it("resolves undefined once install finds AppInsights is not configured", async () => {
    stubSettings(false);

    const mod = await importFresh();
    installPlugin(mod.applicationInsightsPlugin);

    await expect(mod.getAppInsightsWhenReady(1000)).resolves.toBeUndefined();
    expect(mod.getAppInsights()).toBeUndefined();
  });

  it("resolves undefined when configured but onLoaded never fires (timeout path)", async () => {
    // Simulates the SDK being blocked (ad-blocker/CSP): install runs, onLoaded never does.
    appInsightsPluginInstallMock.mockImplementation(() => undefined);
    stubSettings(true, "instrumentation-key");

    const mod = await importFresh();
    installPlugin(mod.applicationInsightsPlugin);

    // Short budget with real timers so the setTimeout/clearTimeout branch actually runs.
    await expect(mod.getAppInsightsWhenReady(20)).resolves.toBeUndefined();
  });
});
