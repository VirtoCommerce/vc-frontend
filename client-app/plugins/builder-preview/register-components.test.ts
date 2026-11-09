import { afterEach, describe, expect, it, vi } from "vitest";

const pageBuilder = vi.hoisted(() => ({ isEnabled: true }));

vi.mock("@/core/theme-snapshot", () => ({ isNewPageBuilderEnabled: () => pageBuilder.isEnabled }));
vi.mock("./page-builder-components", () => ({ PageBuilderComponents: [] }));

describe("getRegisteredComponents", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/");
    vi.resetModules();
  });

  it.each([
    { isEnabled: true, url: "/?protocol=2", hasThemeSchemas: true },
    { isEnabled: true, url: "/", hasThemeSchemas: false },
    { isEnabled: false, url: "/?protocol=2", hasThemeSchemas: false },
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
