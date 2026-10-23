import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DESIGN_FONTS } from "@/core/constants/design";
import { Logger } from "@/core/utilities/logger";
import { getDesign, loadDesignFonts, resolveDesign, setDesignAttribute, setPresetAttribute } from "./index";
import type { DesignType } from "@/core/constants/design";

const settings = vi.hoisted((): { value: Record<string, unknown> } => ({ value: {} }));
const kitLoaded = vi.fn();
const appLoaded = vi.fn();

const fontLinks = () => document.head.querySelectorAll<HTMLLinkElement>("link[data-design-fonts]");

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
    fontLinks().forEach((link) => link.remove());
    vi.restoreAllMocks();
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

  describe("loadDesignFonts", () => {
    it("appends no stylesheet for classic", () => {
      loadDesignFonts("classic");

      expect(fontLinks()).toHaveLength(0);
    });

    it("appends exactly one font stylesheet for soft", () => {
      loadDesignFonts("soft");

      const links = [...fontLinks()];

      expect(links.map((link) => link.href)).toEqual(DESIGN_FONTS.soft);
      expect(links.every((link) => link.rel === "stylesheet")).toBe(true);
      expect(links).toHaveLength(1);
    });

    it("warns with the href when a font stylesheet fails to load", () => {
      const warn = vi.spyOn(Logger, "warn").mockImplementation(() => undefined);
      loadDesignFonts("soft");

      const [link] = fontLinks();
      link.dispatchEvent(new Event("error"));

      expect(warn).toHaveBeenCalledExactlyOnceWith(expect.any(String), link.href);
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

    it("downloads no fonts for classic", async () => {
      await loadDesignStyles("classic");

      expect(fontLinks()).toHaveLength(0);
    });

    it("loads the kit and the app soft styles and the soft fonts for soft", async () => {
      await loadDesignStyles("soft");

      expect(kitLoaded).toHaveBeenCalledOnce();
      expect(appLoaded).toHaveBeenCalledOnce();
      expect(fontLinks()).toHaveLength(1);
    });

    it("resolves without waiting for the soft fonts", async () => {
      await expect(loadDesignStyles("soft")).resolves.toBeUndefined();
      expect(fontLinks()).toHaveLength(1);
    });
  });
});
