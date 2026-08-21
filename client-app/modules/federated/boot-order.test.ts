// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The loader depends on host state that app-runner sets up earlier in the same function, and
 * nothing but the order of those statements enforces it. app-runner is a 400-line boot routine
 * ending in a real `app.mount()`, so asserting this by execution is not practical — this reads
 * the source instead. Each name below appears exactly once followed by "(": the import and
 * destructuring lines do not, so the match is the call site.
 */

const APP_RUNNER = readFileSync(resolve(__dirname, "../../app-runner.ts"), "utf8");

function callSiteIndex(call: string): number {
  const index = APP_RUNNER.indexOf(call);
  expect(index, `"${call}" no longer appears in app-runner.ts — this guard needs revisiting`).toBeGreaterThan(-1);
  expect(APP_RUNNER.indexOf(call, index + 1), `"${call}" appears more than once; the guard is ambiguous`).toBe(-1);
  return index;
}

describe("app-runner boot order", () => {
  it("populates the theme context before starting federated modules", () => {
    // Plugins read store settings through the facade's useModuleSettings, which resolves
    // themeContext.storeSettings — empty until setThemeContext runs.
    expect(callSiteIndex("setThemeContext(")).toBeLessThan(callSiteIndex("startFederatedModules("));
  });

  it("sets the user before starting federated modules", () => {
    // The permission gate reads user.value at call time; an unset user skips every
    // permission-gated plugin for the rest of the page's life.
    expect(callSiteIndex("setUser(")).toBeLessThan(callSiteIndex("startFederatedModules("));
  });
});
