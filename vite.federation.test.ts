// @vitest-environment node
import { describe, expect, it } from "vitest";
import { federatedHostPlugin } from "./vite.federation.js";
import type { Plugin, PluginOption, ResolvedConfig } from "vite";

const FACADE = "@vc-frontend/core";

function flatPlugins(options: PluginOption[]): Plugin[] {
  return options.flat(Infinity as 1).filter((option): option is Plugin => !!option && typeof option === "object");
}

describe("federatedHostPlugin", () => {
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
    expect(flatPlugins(federatedHostPlugin({ module_federation_enabled: true })).length).toBeGreaterThan(0);
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
