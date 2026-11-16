import { beforeEach, describe, expect, it, vi } from "vitest";
import type { App } from "vue";
import type { AppInsightsPluginOptions } from "vue3-application-insights";

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

// Same contract as the real plugin: it hands the instance to `onLoaded` while it is being installed.
vi.mock("vue3-application-insights", () => ({
  AppInsightsPlugin: {
    install: (_app: App, options: AppInsightsPluginOptions) => options.onLoaded?.(appInsights as never),
  },
}));

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
