import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  byDesignName,
  DESIGN_NAMES,
  getDesign,
  loadDesignStyles,
  resolveDesign,
  setDesignAttribute,
  setPresetAttribute,
} from "./index";

const settings = vi.hoisted((): { value: Record<string, unknown> } => ({ value: {} }));
const warn = vi.hoisted(() => vi.fn());

vi.mock("@/config/settings_data.json", () => ({
  default: {
    current: "default",
    get settings() {
      return settings.value;
    },
  },
}));

vi.mock("@/core/utilities/logger", () => ({ Logger: { warn, error: vi.fn() } }));

async function importDesign(dev: boolean) {
  vi.resetModules();
  vi.doMock("@/core/constants/environment", () => ({ IS_DEVELOPMENT: dev }));

  return await import("./index");
}

describe("design", () => {
  beforeEach(() => {
    warn.mockClear();
  });

  afterEach(() => {
    settings.value = {};
    delete document.documentElement.dataset.design;
    delete document.documentElement.dataset.preset;
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

    it("warns once in development for a design without an index.scss", async () => {
      settings.value = { design: "Soft" };

      expect((await importDesign(true)).getDesign()).toBe("classic");
      expect(warn).toHaveBeenCalledExactlyOnceWith(
        expect.stringContaining('"Soft": there is no client-app/designs/Soft/index.scss'),
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

    it("writes data-preset on <html> and replaces the previous value", () => {
      setPresetAttribute("coffee");
      setPresetAttribute("red");

      expect(document.documentElement.getAttribute("data-preset")).toBe("red");
    });
  });

  describe("loadDesignStyles", () => {
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
