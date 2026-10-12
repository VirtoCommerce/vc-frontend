// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { federatedDefine, federatedHostPlugin } from "./vite.federation.js";
import type { Plugin, PluginOption, ResolvedConfig } from "vite";

const FACADE = "@vc-frontend/core";

function flatPlugins(options: PluginOption[]): Plugin[] {
  return options.flat(Infinity as 1).filter((option): option is Plugin => !!option && typeof option === "object");
}

describe("federatedHostPlugin", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns no plugins with the theme config as shipped", () => {
    expect(federatedHostPlugin()).toEqual([]);
  });

  it.each([{}, { module_federation_enabled: false }, { module_federation_enabled: "true" }])(
    "returns no plugins when the theme settings are %j",
    (settings) => {
      expect(federatedHostPlugin(settings)).toEqual([]);
    },
  );

  it("returns the MF host plugins when the theme sets module_federation_enabled to true", () => {
    // federation() returns no plugins under a test runner unless told otherwise.
    vi.stubEnv("MFE_VITE_NO_TEST_ENV_CHECK", "true");

    const names = flatPlugins(federatedHostPlugin({ module_federation_enabled: true })).map(({ name }) => name);

    expect(names).toContain("module-federation-vite");
  });

  it("defines __MF_HOST__ from the same switch", () => {
    expect(federatedDefine()).toEqual({ __MF_HOST__: "false" });
    expect(federatedDefine({ module_federation_enabled: true })).toEqual({ __MF_HOST__: "true" });
    expect(federatedDefine({ module_federation_enabled: "true" })).toEqual({ __MF_HOST__: "false" });
  });

  it("moves the facade from optimizeDeps.include to optimizeDeps.exclude on serve", () => {
    const plugin = flatPlugins(federatedHostPlugin({ module_federation_enabled: true })).find(
      ({ name }) => name === "vc-frontend:facade-out-of-optimize-deps",
    );
    const config = { optimizeDeps: { include: ["vue", FACADE], exclude: [FACADE, "other"] } } as ResolvedConfig;

    expect(plugin?.apply).toBe("serve");
    (plugin?.configResolved as (config: ResolvedConfig) => void)(config);

    expect(config.optimizeDeps.include).toEqual(["vue"]);
    expect(config.optimizeDeps.exclude).toEqual(["other", FACADE]);
  });
});
