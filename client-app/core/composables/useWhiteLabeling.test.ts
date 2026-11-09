import { beforeEach, describe, expect, it, vi } from "vitest";
import { useThemeSnapshot } from "@/core/theme-snapshot/useThemeSnapshot";
import { useWhiteLabeling } from "./useWhiteLabeling";
import type { WhiteLabelingSettingsType } from "@/core/api/graphql/types";

vi.mock("@/core/api/graphql/whiteLabeling/queries", () => ({ getGetWhiteLabelingSettings: vi.fn() }));

vi.mock("./useThemeContext", async () => {
  const { computed } = await import("vue");

  return {
    useThemeContext: () => ({
      modulesSettings: computed(() => [
        {
          moduleId: "VirtoCommerce.WhiteLabeling",
          settings: [{ name: "WhiteLabeling.WhiteLabelingEnabled", value: true }],
        },
      ]),
      themeContext: computed(() => ({ settings: { logo_image: "logo.svg", logo_inverted_image: "logo-white.svg" } })),
    }),
  };
});

function setWhiteLabeling(settings?: WhiteLabelingSettingsType): void {
  useWhiteLabeling().setWhiteLabelingSettings(settings);
}

describe("useWhiteLabeling", () => {
  beforeEach(() => {
    setWhiteLabeling();
    useThemeSnapshot().setDraft(undefined);
  });

  describe("darkLogoUrl", () => {
    it("takes the storefront's logo for dark backgrounds with the storefront's own logo", () => {
      const { logoUrl, darkLogoUrl } = useWhiteLabeling();

      expect(logoUrl.value).toBe("logo.svg");
      expect(darkLogoUrl.value).toBe("logo-white.svg");
    });

    it("takes the store's logo for dark backgrounds with the store's white-labeling logo", () => {
      setWhiteLabeling({ logoUrl: "store.svg", secondaryLogoUrl: "store-white.svg" });

      expect(useWhiteLabeling().darkLogoUrl.value).toBe("store-white.svg");
    });

    it("takes none with an organization's logo, so the organization's logo stays", () => {
      setWhiteLabeling({ logoUrl: "org.svg", secondaryLogoUrl: "store-white.svg", isOrganizationLogoUploaded: true });

      expect(useWhiteLabeling().darkLogoUrl.value).toBeUndefined();
    });

    it("takes none with a theme's logo that has no logo for dark backgrounds", () => {
      useThemeSnapshot().setDraft({ brand: { logoUrl: "acme.svg" } });
      const { logoUrl, darkLogoUrl } = useWhiteLabeling();

      expect(logoUrl.value).toBe("acme.svg");
      expect(darkLogoUrl.value).toBeUndefined();
    });

    it("takes the theme's logo for dark backgrounds with the theme's logo", () => {
      useThemeSnapshot().setDraft({ brand: { logoUrl: "acme.svg", secondaryLogoUrl: "acme-white.svg" } });

      expect(useWhiteLabeling().darkLogoUrl.value).toBe("acme-white.svg");
    });
  });

  describe("themeFieldsSetByWhiteLabeling", () => {
    it("names nothing without white-labeling", () => {
      expect(useWhiteLabeling().themeFieldsSetByWhiteLabeling.value).toEqual([]);
    });

    it("names the header's menus for a main menu and the footer's for footer links", () => {
      const link = { title: "Shop", url: "/shop", priority: 0, childItems: [] };
      setWhiteLabeling({ logoUrl: "store.svg", mainMenuLinks: [link], footerLinks: [link] });

      expect(useWhiteLabeling().themeFieldsSetByWhiteLabeling.value).toEqual([
        "brand.logoUrl",
        "menus.header",
        "menus.footer",
      ]);
    });

    it("does not name a menu white-labeling leaves empty", () => {
      setWhiteLabeling({ mainMenuLinks: [], footerLinks: [] });

      expect(useWhiteLabeling().themeFieldsSetByWhiteLabeling.value).toEqual([]);
    });
  });
});
