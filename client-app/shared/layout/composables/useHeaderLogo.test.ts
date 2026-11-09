import { beforeEach, describe, expect, it, vi } from "vitest";
import { useWhiteLabeling } from "@/core/composables/useWhiteLabeling";
import { useThemeSnapshot } from "@/core/theme-snapshot/useThemeSnapshot";
import { useHeaderLogo } from "./useHeaderLogo";

const mocks = vi.hoisted(() => ({ isPageBuilderEnabled: true, isDark: { value: true } }));

vi.mock("@/core/theme-snapshot/enabled", () => ({ isNewPageBuilderEnabled: () => mocks.isPageBuilderEnabled }));
vi.mock("@/core/composables/useDarkMode", () => ({ useDarkMode: () => ({ isDark: mocks.isDark }) }));
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

describe("useHeaderLogo", () => {
  beforeEach(() => {
    mocks.isPageBuilderEnabled = true;
    mocks.isDark.value = true;
    useWhiteLabeling().setWhiteLabelingSettings();
    useThemeSnapshot().setDraft({ brand: { logoUrl: "acme.svg", secondaryLogoUrl: "acme-white.svg" } });
  });

  it("shows the theme's logo for dark backgrounds in the dark theme with the theme's logo", () => {
    expect(useHeaderLogo().headerLogoUrl.value).toBe("acme-white.svg");
  });

  it("shows white-labeling's light logo in the dark theme, never the theme's logo for dark backgrounds", () => {
    useWhiteLabeling().setWhiteLabelingSettings({ logoUrl: "store.svg" });

    expect(useHeaderLogo().headerLogoUrl.value).toBe("store.svg");
  });

  it("shows white-labeling's logo for dark backgrounds with white-labeling's logo", () => {
    useWhiteLabeling().setWhiteLabelingSettings({ logoUrl: "store.svg", secondaryLogoUrl: "store-white.svg" });

    expect(useHeaderLogo().headerLogoUrl.value).toBe("store-white.svg");
  });

  it("shows the light logo in the light theme", () => {
    mocks.isDark.value = false;

    expect(useHeaderLogo().headerLogoUrl.value).toBe("acme.svg");
  });
});
