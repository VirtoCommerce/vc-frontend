import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDesign, resolveDesign, setDesignAttribute, setPresetAttribute } from "./index";
import type { DesignType } from "@/core/constants/design";

const settings = vi.hoisted((): { value: Record<string, unknown> } => ({ value: {} }));
const kitLoaded = vi.fn();
const appLoaded = vi.fn();

vi.mock("@/config/settings_data.json", () => ({
  default: {
    current: "default",
    get settings() {
      return settings.value;
    },
  },
}));

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
    async function loadDesignStyles(design: DesignType): Promise<void> {
      const module = await import("./index");
      await module.loadDesignStyles(design);
    }

    beforeEach(() => {
      vi.resetModules();
      kitLoaded.mockClear();
      appLoaded.mockClear();
      vi.doMock("@/ui-kit/styles/soft/index.scss", () => {
        kitLoaded();
        return {};
      });
      vi.doMock("@/assets/styles/soft/index.scss", () => {
        appLoaded();
        return {};
      });
    });

    it("downloads nothing for classic", async () => {
      await loadDesignStyles("classic");

      expect(kitLoaded).not.toHaveBeenCalled();
      expect(appLoaded).not.toHaveBeenCalled();
    });

    it("loads the kit and the app soft styles for soft", async () => {
      await loadDesignStyles("soft");

      expect(kitLoaded).toHaveBeenCalledOnce();
      expect(appLoaded).toHaveBeenCalledOnce();
    });
  });
});
