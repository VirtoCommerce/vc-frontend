import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pageBuilder = vi.hoisted(() => ({ isEnabled: true }));

vi.mock("@/core/theme-snapshot/enabled", () => ({ isNewPageBuilderEnabled: () => pageBuilder.isEnabled }));
vi.mock("./page-builder-components", () => ({ PageBuilderComponents: [] }));

describe("getRegisteredComponents", () => {
  beforeEach(() => {
    vi.stubGlobal("parent", {});
  });

  afterEach(() => {
    window.history.replaceState(null, "", "/");
    sessionStorage.clear();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it.each([
    { isEnabled: true, url: "/?ep=https%3A%2F%2Fbuilder.example&protocol=2", hasThemeSchemas: true },
    { isEnabled: true, url: "/?ep=https%3A%2F%2Fbuilder.example", hasThemeSchemas: false },
    { isEnabled: false, url: "/?ep=https%3A%2F%2Fbuilder.example&protocol=2", hasThemeSchemas: false },
  ])(
    "with the flag $isEnabled at $url, theme schemas: $hasThemeSchemas",
    async ({ isEnabled, url, hasThemeSchemas }) => {
      pageBuilder.isEnabled = isEnabled;
      window.history.replaceState(null, "", url);

      const { getRegisteredComponents } = await import("./register-components");
      const { sections } = await getRegisteredComponents();

      expect("site-header" in sections).toBe(hasThemeSchemas);
    },
  );
});
