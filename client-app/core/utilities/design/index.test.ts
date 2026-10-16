import { afterEach, describe, expect, it, vi } from "vitest";
import { getDesign, loadDesignStyles, resolveDesign, setDesignAttribute, setPresetAttribute } from "./index";

const settings = vi.hoisted((): { value: Record<string, unknown> } => ({ value: {} }));
const loadedStyles = vi.hoisted((): string[] => []);

vi.mock("@/config/settings_data.json", () => ({
  default: {
    current: "default",
    get settings() {
      return settings.value;
    },
  },
}));

vi.mock("@/ui-kit/styles/soft/index.scss", () => {
  loadedStyles.push("kit");
  return {};
});

vi.mock("@/assets/styles/soft/index.scss", () => {
  loadedStyles.push("app");
  return {};
});

describe("design", () => {
  afterEach(() => {
    settings.value = {};
    delete document.documentElement.dataset.design;
    delete document.documentElement.dataset.preset;
  });

  describe("resolveDesign", () => {
    it("keeps soft", () => {
      expect(resolveDesign("soft")).toBe("soft");
    });

    it("keeps classic", () => {
      expect(resolveDesign("classic")).toBe("classic");
    });

    it.each([undefined, null, "", "Soft", "dark", 1])("falls back to classic for %j", (value) => {
      expect(resolveDesign(value)).toBe("classic");
    });
  });

  describe("getDesign", () => {
    it("reads the design setting", () => {
      settings.value = { design: "soft" };

      expect(getDesign()).toBe("soft");
    });

    it("is classic when the setting is missing", () => {
      settings.value = {};

      expect(getDesign()).toBe("classic");
    });
  });

  describe("attributes", () => {
    it.each(["classic", "soft"] as const)("writes data-design=%s on <html>", (design) => {
      setDesignAttribute(design);

      expect(document.documentElement.getAttribute("data-design")).toBe(design);
    });

    it("writes data-preset on <html> and replaces the previous value", () => {
      setPresetAttribute("coffee");
      setPresetAttribute("red");

      expect(document.documentElement.getAttribute("data-preset")).toBe("red");
    });
  });

  describe("loadDesignStyles", () => {
    it("downloads nothing for classic", async () => {
      await loadDesignStyles("classic");

      expect(loadedStyles).toEqual([]);
    });

    it("loads the kit and the app soft styles for soft", async () => {
      await loadDesignStyles("soft");

      expect(loadedStyles).toEqual(expect.arrayContaining(["app", "kit"]));
      expect(loadedStyles).toHaveLength(2);
    });
  });
});
