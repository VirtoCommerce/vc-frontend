import { beforeEach, describe, expect, it, vi } from "vitest";
import { useWhiteLabeling } from "@/core/composables/useWhiteLabeling";
import { useThemeSnapshot } from "@/core/theme-snapshot/useThemeSnapshot";
import { useFooterLogo } from "./useFooterLogo";
import type { WhiteLabelingSettingsType } from "@/core/api/graphql/types";
import type { IThemeDraft } from "@/core/theme-snapshot";

const pageBuilder = vi.hoisted(() => ({ isEnabled: true }));

vi.mock("@/core/theme-snapshot/enabled", () => ({ isNewPageBuilderEnabled: () => pageBuilder.isEnabled }));
vi.mock("@/core/api/graphql/whiteLabeling/queries", () => ({ getGetWhiteLabelingSettings: vi.fn() }));
vi.mock("@/core/composables/useThemeContext", async () => {
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

const THEME_LOGOS: IThemeDraft = { brand: { logoUrl: "acme.svg", secondaryLogoUrl: "acme-white.svg" } };

describe("useFooterLogo", () => {
  beforeEach(() => {
    pageBuilder.isEnabled = true;
    useWhiteLabeling().setWhiteLabelingSettings();
    useThemeSnapshot().setDraft(undefined);
  });

  it.each<[string, WhiteLabelingSettingsType | undefined, IThemeDraft | undefined, string]>([
    [
      "the storefront's logo for dark backgrounds without white-labeling or a theme",
      undefined,
      undefined,
      "logo-white.svg",
    ],
    ["the theme's logo for dark backgrounds with the theme's logo", undefined, THEME_LOGOS, "acme-white.svg"],
    [
      "the theme's light logo when the theme has none for dark backgrounds",
      undefined,
      { brand: { logoUrl: "acme.svg" } },
      "acme.svg",
    ],
    [
      "white-labeling's logo for dark backgrounds with white-labeling's logo",
      { logoUrl: "store.svg", secondaryLogoUrl: "store-white.svg" },
      THEME_LOGOS,
      "store-white.svg",
    ],
    [
      "white-labeling's light logo, never the theme's for dark backgrounds",
      { logoUrl: "store.svg" },
      THEME_LOGOS,
      "store.svg",
    ],
    [
      "an organization's logo, never a logo for dark backgrounds that may be the store's",
      { logoUrl: "org.svg", secondaryLogoUrl: "store-white.svg", isOrganizationLogoUploaded: true },
      THEME_LOGOS,
      "org.svg",
    ],
  ])("shows %s", (_, whiteLabeling, theme, expected) => {
    useWhiteLabeling().setWhiteLabelingSettings(whiteLabeling);
    useThemeSnapshot().setDraft(theme);

    expect(useFooterLogo().footerLogoUrl.value).toBe(expected);
  });

  it("keeps white-labeling's logo for dark backgrounds field by field without the new Page Builder", () => {
    pageBuilder.isEnabled = false;
    useWhiteLabeling().setWhiteLabelingSettings({ secondaryLogoUrl: "store-white.svg" });

    expect(useFooterLogo().footerLogoUrl.value).toBe("store-white.svg");
  });
});
