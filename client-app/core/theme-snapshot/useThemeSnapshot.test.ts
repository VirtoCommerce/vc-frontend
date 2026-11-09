import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IPublishedTheme } from "./types";

const THEME: IPublishedTheme = {
  storeId: "B2B-store",
  cultureName: "en-US",
  publication: 1,
  snapshot: { format: 1, publication: 1, cultureName: "en-US", templates: {} },
  menus: [],
};

async function loadThemeSnapshot() {
  vi.resetModules();
  const { useThemeSnapshot } = await import("./useThemeSnapshot");
  return useThemeSnapshot();
}

describe("useThemeSnapshot", () => {
  describe("hasNoTheme", () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it("is false until a snapshot is accepted, and after a failed request", async () => {
      const { hasNoTheme, setFailed } = await loadThemeSnapshot();
      expect(hasNoTheme.value).toBe(false);

      setFailed();
      expect(hasNoTheme.value).toBe(false);
    });

    it("is true once the store turns out to have no theme, until a theme is accepted", async () => {
      const { hasNoTheme, setPublished } = await loadThemeSnapshot();

      setPublished(null);
      expect(hasNoTheme.value).toBe(true);

      setPublished(THEME);
      expect(hasNoTheme.value).toBe(false);
    });

    it("is false while the designer sends a draft", async () => {
      const { hasNoTheme, setPublished, setDraft } = await loadThemeSnapshot();
      setPublished(null);

      setDraft({ brand: { logoUrl: "acme.svg" } });

      expect(hasNoTheme.value).toBe(false);
    });

    it("stays as it is while a late snapshot waits for the next navigation", async () => {
      const { hasNoTheme, setLate, promoteLate } = await loadThemeSnapshot();

      setLate(null);
      expect(hasNoTheme.value).toBe(false);

      promoteLate();
      expect(hasNoTheme.value).toBe(true);
    });
  });
});
