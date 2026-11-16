import { beforeEach, describe, expect, it, vi } from "vitest";
import type { App } from "vue";

const moduleSettings = vi.hoisted<{ enabled: boolean; instrumentationKey?: string }>(() => ({
  enabled: true,
  instrumentationKey: "key",
}));
const appInsights = vi.hoisted(() => ({ trackException: vi.fn() }));

vi.mock("@/core/composables/useModuleSettings", () => ({
  useModuleSettings: () => ({
    isEnabled: () => moduleSettings.enabled,
    getSettingValue: () => moduleSettings.instrumentationKey,
  }),
}));

// Same contract as the real plugin: the instance is provided to the app, and `useAppInsights` injects it.
vi.mock("vue3-application-insights", async () => {
  const { inject } = await import("vue");
  const injectKey = Symbol("appInsights");
  return {
    AppInsightsPlugin: { install: (app: App) => app.provide(injectKey, appInsights) },
    useAppInsights: () => inject(injectKey),
  };
});

/** Installs a fresh copy of the plugin, so the instance it keeps never carries over between tests. */
async function install(): Promise<typeof import("./applicationInsights.plugin")> {
  vi.resetModules();
  const { createApp } = await import("vue");
  const pluginModule = await import("./applicationInsights.plugin");
  createApp({}).use(pluginModule.applicationInsightsPlugin);
  return pluginModule;
}

beforeEach(() => {
  moduleSettings.enabled = true;
  moduleSettings.instrumentationKey = "key";
});

describe("getAppInsights", () => {
  it("returns the installed instance to code outside component setup", async () => {
    const { getAppInsights } = await install();

    expect(getAppInsights()).toBe(appInsights);
  });

  it("returns nothing when Application Insights is disabled or has no instrumentation key", async () => {
    moduleSettings.enabled = false;
    expect((await install()).getAppInsights()).toBeUndefined();

    moduleSettings.enabled = true;
    moduleSettings.instrumentationKey = undefined;
    expect((await install()).getAppInsights()).toBeUndefined();
  });
});
