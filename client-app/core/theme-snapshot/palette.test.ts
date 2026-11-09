import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick } from "vue";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { writeThemeVariables } from "@/core/plugins/config.plugin";
import { setupThemePalette } from "./palette";
import { useThemeSnapshot } from "./useThemeSnapshot";
import type { IThemePalette } from "./types";
import type { StoreResponseType } from "@/core/api/graphql/types";
import type { EffectScope } from "vue";

const setActivePreset = vi.hoisted(() => vi.fn());

vi.mock("@/assets/presets", () => ({
  presets: { coffee: { color_primary_50: "#coffee", color_primary_100: "#coffee" } },
  darkPresets: { coffee: { color_primary_50: "#coffee-dark", color_primary_100: "#coffee-dark" } },
}));
vi.mock("@/core/composables/useDarkMode", () => ({ useDarkMode: () => ({ setActivePreset }) }));
vi.mock("@/core/plugins/config.plugin", () => ({ writeThemeVariables: vi.fn() }));

function publish(palette: IThemePalette | undefined): void {
  useThemeSnapshot().setPublished({
    storeId: "store",
    cultureName: "en-US",
    publication: 1,
    menus: [],
    snapshot: { format: 1, publication: 1, cultureName: "en-US", templates: {}, palette },
  });
}

describe("setupThemePalette", () => {
  const { setThemeContext, addPresetToThemeContext, themeContext } = useThemeContext();
  let scope: EffectScope | undefined;

  function setup(hasWhiteLabelingPreset = false): void {
    scope = effectScope();
    scope.run(() => setupThemePalette(() => hasWhiteLabelingPreset));
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    useThemeSnapshot().setPublished(null);
    setThemeContext({ id: "test-store", name: "Test Store", settings: {} } as unknown as StoreResponseType);
    await addPresetToThemeContext("coffee");
  });

  afterEach(() => {
    scope?.stop();
  });

  it("puts the theme's palette in place of the preset", () => {
    publish({ light: { color_primary_50: "#theme" }, dark: { color_primary_50: "#theme-dark" } });

    setup();

    expect(themeContext.value.preset?.color_primary_50).toBe("#theme");
    expect(themeContext.value.darkPreset?.color_primary_50).toBe("#theme-dark");
  });

  it("has no dark theme when the palette has no dark part", () => {
    publish({ light: { color_primary_50: "#light-only" } });

    setup();

    expect(themeContext.value.darkPreset).toBeUndefined();
    expect(setActivePreset).toHaveBeenLastCalledWith("coffee", false);
  });

  it("keeps the preset's value of a token the theme's palette lacks", () => {
    publish({ light: { color_primary_50: "#theme" }, dark: { color_primary_50: "#theme-dark" } });

    setup();

    expect(themeContext.value.preset?.color_primary_100).toBe("#coffee");
    expect(themeContext.value.darkPreset?.color_primary_100).toBe("#coffee-dark");
  });

  it("writes the next palette, and the preset once the palette is gone", async () => {
    setup();

    publish({ light: { color_primary_50: "#theme" } });
    await nextTick();

    expect(writeThemeVariables).toHaveBeenLastCalledWith(
      expect.objectContaining({ color_primary_50: "#theme", color_primary_100: "#coffee" }),
      undefined,
    );

    useThemeSnapshot().setPublished(null);
    await nextTick();

    expect(writeThemeVariables).toHaveBeenLastCalledWith(
      expect.objectContaining({ color_primary_50: "#coffee" }),
      expect.objectContaining({ color_primary_50: "#coffee-dark" }),
    );
  });

  it("leaves the preset that white-labeling chose", async () => {
    publish({ light: { color_primary_50: "#theme" } });

    setup(true);
    publish({ light: { color_primary_50: "#theme-next" } });
    await nextTick();

    expect(themeContext.value.preset?.color_primary_50).toBe("#coffee");
    expect(writeThemeVariables).not.toHaveBeenCalled();
  });

  it("keeps the preset's stylesheet scope on <html> under the theme's palette", () => {
    publish({ light: { color_primary_50: "#theme" } });

    setup();

    expect(document.documentElement.getAttribute("data-preset")).toBe("coffee");
  });
});
