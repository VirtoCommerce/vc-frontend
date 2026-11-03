import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { design as softDesign } from "@/designs/soft/design";
import {
  byDesignName,
  DESIGN_NAMES,
  getDesign,
  getDesignFonts,
  loadDesignFonts,
  loadDesignStyles,
  resolveDesign,
  setDesignAttribute,
} from "./index";

const settings = vi.hoisted((): { value: Record<string, unknown> } => ({ value: {} }));
const warn = vi.hoisted(() => vi.fn());

const fontLinks = () => document.head.querySelectorAll<HTMLLinkElement>("link[data-design-fonts]");

vi.mock("@/config/settings_data.json", () => ({
  default: {
    current: "default",
    get settings() {
      return settings.value;
    },
  },
}));

vi.mock("@/core/utilities/logger", () => ({ Logger: { warn, error: vi.fn() } }));

vi.mock("@/designs/custom-fonts", () => ({ customFonts: {} }));

async function importDesign(dev: boolean) {
  vi.resetModules();
  vi.doMock("@/core/constants/environment", () => ({ IS_DEVELOPMENT: dev }));

  return await import("./index");
}

describe("design", () => {
  beforeEach(() => {
    warn.mockClear();
    fontLinks().forEach((link) => link.remove());
  });

  afterEach(() => {
    settings.value = {};
    delete document.documentElement.dataset.design;
    vi.doUnmock("@/core/constants/environment");
    vi.doUnmock("@/designs/soft/index.scss");
  });

  describe("byDesignName", () => {
    it("keys modules by their design folder", () => {
      expect(
        byDesignName({ "/client-app/designs/soft/index.scss": 1, "/client-app/designs/my-brand/index.scss": 2 }),
      ).toEqual({ soft: 1, "my-brand": 2 });
    });

    it("skips a key without a folder", () => {
      expect(byDesignName({ "index.scss": 1, "/index.scss": 2, "/client-app/designs/soft/index.scss": 3 })).toEqual({
        soft: 3,
      });
    });
  });

  describe("DESIGN_NAMES", () => {
    it("lists the design folders, classic not among them", () => {
      expect(DESIGN_NAMES).toContain("soft");
      expect(DESIGN_NAMES).not.toContain("classic");
    });
  });

  describe("resolveDesign", () => {
    it("keeps soft", () => {
      expect(resolveDesign("soft")).toBe("soft");
    });

    it("keeps classic", () => {
      expect(resolveDesign("classic")).toBe("classic");
    });

    it("keeps a design that has a folder", () => {
      expect(resolveDesign("mybrand", ["mybrand"])).toBe("mybrand");
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

    it("warns once in development for a name that matches a design only when case is ignored", async () => {
      settings.value = { design: "Soft" };

      expect((await importDesign(true)).getDesign()).toBe("classic");
      expect(warn).toHaveBeenCalledExactlyOnceWith(
        expect.stringContaining('"Soft": no folder in client-app/designs/ with an index.scss has exactly this name'),
      );
    });

    it.each([{}, { design: "classic" }, { design: "soft" }])("does not warn for %j", async (value) => {
      settings.value = value;

      (await importDesign(true)).getDesign();

      expect(warn).not.toHaveBeenCalled();
    });

    it.each(["", null, 1])("falls back to classic without a warning for %j", async (design) => {
      settings.value = { design };

      expect((await importDesign(true)).getDesign()).toBe("classic");
      expect(warn).not.toHaveBeenCalled();
    });

    it("does not warn outside development", async () => {
      settings.value = { design: "Soft" };

      expect((await importDesign(false)).getDesign()).toBe("classic");
      expect(warn).not.toHaveBeenCalled();
    });
  });

  describe("attributes", () => {
    it.each(["classic", "soft", "mybrand"])("writes data-design=%s on <html>", (design) => {
      setDesignAttribute(design);

      expect(document.documentElement.getAttribute("data-design")).toBe(design);
    });
  });

  describe("getDesignFonts", () => {
    it("lists no fonts for classic", () => {
      expect(getDesignFonts("classic")).toEqual([]);
    });

    it("takes soft's fonts from designs/soft/design.ts", () => {
      expect(getDesignFonts("soft")).toEqual(softDesign.fonts);
      expect(softDesign.fonts).toHaveLength(1);
    });

    it("lets custom fonts replace a design's own", () => {
      expect(getDesignFonts("b", { b: { fonts: ["https://f/a.css"] } }, { b: ["https://f/c.css"] })).toEqual([
        "https://f/c.css",
      ]);
    });

    it("loads no fonts for an empty custom list", () => {
      expect(getDesignFonts("b", { b: { fonts: ["https://f/a.css"] } }, { b: [] })).toEqual([]);
    });

    it("lists no fonts for a design named like an object member", () => {
      expect(getDesignFonts("constructor", {}, {})).toEqual([]);
    });
  });

  describe("loadDesignFonts", () => {
    it("appends one stylesheet link per font URL", () => {
      loadDesignFonts("b", ["https://f/a.css", "https://f/c.css"]);

      expect([...fontLinks()].map((link) => [link.rel, link.href])).toEqual([
        ["stylesheet", "https://f/a.css"],
        ["stylesheet", "https://f/c.css"],
      ]);
    });

    it("replaces the previous design's links, and classic clears them", () => {
      loadDesignFonts("b", ["https://f/a.css"]);
      loadDesignFonts("classic");

      expect(fontLinks()).toHaveLength(0);

      loadDesignFonts("c", ["https://f/c.css"]);

      expect([...fontLinks()].map((link) => link.href)).toEqual(["https://f/c.css"]);
    });

    it("warns with the href when a font stylesheet fails to load", () => {
      loadDesignFonts("b", ["https://f/a.css"]);

      const [link] = fontLinks();
      link.dispatchEvent(new Event("error"));

      expect(warn).toHaveBeenCalledExactlyOnceWith(expect.any(String), link.href);
    });
  });

  describe("loadDesignStyles", () => {
    it("downloads no fonts for classic", async () => {
      await loadDesignStyles("classic", { classic: vi.fn() });

      expect(fontLinks()).toHaveLength(0);
    });

    it("loads the soft fonts with the soft styles", async () => {
      const load = vi.fn(async () => ({}));

      await loadDesignStyles("soft", { soft: load });

      expect(load).toHaveBeenCalledOnce();
      expect([...fontLinks()].map((link) => link.href)).toEqual(softDesign.fonts);
    });

    it("resolves without waiting for the soft fonts", async () => {
      await expect(loadDesignStyles("soft", { soft: vi.fn(async () => ({})) })).resolves.toBeUndefined();
      expect(fontLinks()).toHaveLength(1);
    });

    it("downloads nothing for classic", async () => {
      const load = vi.fn();

      await loadDesignStyles("classic", { classic: load });

      expect(load).not.toHaveBeenCalled();
    });

    it("loads the design's own chunk", async () => {
      const load = vi.fn(async () => ({}));

      await loadDesignStyles("mybrand", { mybrand: load });

      expect(load).toHaveBeenCalledOnce();
    });

    it("loads a design folder's index.scss by default", async () => {
      const loaded = vi.fn();

      vi.doMock("@/designs/soft/index.scss", () => {
        loaded();

        return {};
      });

      await (await importDesign(false)).loadDesignStyles("soft");

      expect(loaded).toHaveBeenCalledOnce();
    });

    it("downloads nothing for a design without a folder", async () => {
      const load = vi.fn();

      await loadDesignStyles("ghost", { mybrand: load });

      expect(load).not.toHaveBeenCalled();
    });
  });
});
