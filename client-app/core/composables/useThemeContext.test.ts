import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { StoreResponseType } from "@/core/api/graphql/types";
import type { IThemeConfigPreset } from "@/core/types";

const hoisted = vi.hoisted(() => {
  const dynamicPresetsCache = new Map<string, IThemeConfigPreset>();

  const mockPreset: IThemeConfigPreset = {
    color_primary_50: "#f0f9ff",
    color_primary_100: "#e0f2fe",
    color_primary_200: "#bae6fd",
    color_primary_300: "#7dd3fc",
    color_primary_400: "#38bdf8",
    color_primary_500: "#0ea5e9",
    color_primary_600: "#0284c7",
    color_primary_700: "#0369a1",
    color_primary_800: "#075985",
    color_primary_900: "#0c4a6e",
    color_primary_950: "#082f49",
    color_secondary_50: "#fafafa",
    color_secondary_100: "#f4f4f5",
    color_secondary_200: "#e4e4e7",
    color_secondary_300: "#d4d4d8",
    color_secondary_400: "#a1a1aa",
    color_secondary_500: "#71717a",
    color_secondary_600: "#52525b",
    color_secondary_700: "#3f3f46",
    color_secondary_800: "#27272a",
    color_secondary_900: "#18181b",
    color_secondary_950: "#09090b",
    color_accent_50: "#fef2f2",
    color_accent_100: "#fee2e2",
    color_accent_200: "#fecaca",
    color_accent_300: "#fca5a5",
    color_accent_400: "#f87171",
    color_accent_500: "#ef4444",
    color_accent_600: "#dc2626",
    color_accent_700: "#b91c1c",
    color_accent_800: "#991b1b",
    color_accent_900: "#7f1d1d",
    color_accent_950: "#450a0a",
    color_neutral_50: "#fafafa",
    color_neutral_100: "#f5f5f5",
    color_neutral_200: "#e5e5e5",
    color_neutral_300: "#d4d4d4",
    color_neutral_400: "#a3a3a3",
    color_neutral_500: "#737373",
    color_neutral_600: "#525252",
    color_neutral_700: "#404040",
    color_neutral_800: "#262626",
    color_neutral_900: "#171717",
    color_neutral_950: "#0a0a0a",
    color_warning_50: "#fffbeb",
    color_warning_100: "#fef3c7",
    color_warning_200: "#fde68a",
    color_warning_300: "#fcd34d",
    color_warning_400: "#fbbf24",
    color_warning_500: "#f59e0b",
    color_warning_600: "#d97706",
    color_warning_700: "#b45309",
    color_warning_800: "#92400e",
    color_warning_900: "#78350f",
    color_warning_950: "#451a03",
    color_danger_50: "#fef2f2",
    color_danger_100: "#fee2e2",
    color_danger_200: "#fecaca",
    color_danger_300: "#fca5a5",
    color_danger_400: "#f87171",
    color_danger_500: "#ef4444",
    color_danger_600: "#dc2626",
    color_danger_700: "#b91c1c",
    color_danger_800: "#991b1b",
    color_danger_900: "#7f1d1d",
    color_danger_950: "#450a0a",
    color_success_50: "#f0fdf4",
    color_success_100: "#dcfce7",
    color_success_200: "#bbf7d0",
    color_success_300: "#86efac",
    color_success_400: "#4ade80",
    color_success_500: "#22c55e",
    color_success_600: "#16a34a",
    color_success_700: "#15803d",
    color_success_800: "#166534",
    color_success_900: "#14532d",
    color_success_950: "#052e16",
    color_info_50: "#eff6ff",
    color_info_100: "#dbeafe",
    color_info_200: "#bfdbfe",
    color_info_300: "#93c5fd",
    color_info_400: "#60a5fa",
    color_info_500: "#3b82f6",
    color_info_600: "#2563eb",
    color_info_700: "#1d4ed8",
    color_info_800: "#1e40af",
    color_info_900: "#1e3a8a",
    color_info_950: "#172554",
    color_additional_50: "#ffffff",
    color_additional_950: "#000000",
  };

  return {
    dynamicPresetsCache,
    mockPreset,
  };
});

vi.mock("@/assets/presets", () => ({
  presets: {
    default: {
      color_primary_50: "#default",
      color_primary_100: "#default",
      color_primary_200: "#default",
      color_primary_300: "#default",
      color_primary_400: "#default",
      color_primary_500: "#default",
      color_primary_600: "#default",
      color_primary_700: "#default",
      color_primary_800: "#default",
      color_primary_900: "#default",
      color_primary_950: "#default",
      color_secondary_50: "#default",
      color_secondary_100: "#default",
      color_secondary_200: "#default",
      color_secondary_300: "#default",
      color_secondary_400: "#default",
      color_secondary_500: "#default",
      color_secondary_600: "#default",
      color_secondary_700: "#default",
      color_secondary_800: "#default",
      color_secondary_900: "#default",
      color_secondary_950: "#default",
      color_accent_50: "#default",
      color_accent_100: "#default",
      color_accent_200: "#default",
      color_accent_300: "#default",
      color_accent_400: "#default",
      color_accent_500: "#default",
      color_accent_600: "#default",
      color_accent_700: "#default",
      color_accent_800: "#default",
      color_accent_900: "#default",
      color_accent_950: "#default",
      color_neutral_50: "#default",
      color_neutral_100: "#default",
      color_neutral_200: "#default",
      color_neutral_300: "#default",
      color_neutral_400: "#default",
      color_neutral_500: "#default",
      color_neutral_600: "#default",
      color_neutral_700: "#default",
      color_neutral_800: "#default",
      color_neutral_900: "#default",
      color_neutral_950: "#default",
      color_warning_50: "#default",
      color_warning_100: "#default",
      color_warning_200: "#default",
      color_warning_300: "#default",
      color_warning_400: "#default",
      color_warning_500: "#default",
      color_warning_600: "#default",
      color_warning_700: "#default",
      color_warning_800: "#default",
      color_warning_900: "#default",
      color_warning_950: "#default",
      color_danger_50: "#default",
      color_danger_100: "#default",
      color_danger_200: "#default",
      color_danger_300: "#default",
      color_danger_400: "#default",
      color_danger_500: "#default",
      color_danger_600: "#default",
      color_danger_700: "#default",
      color_danger_800: "#default",
      color_danger_900: "#default",
      color_danger_950: "#default",
      color_success_50: "#default",
      color_success_100: "#default",
      color_success_200: "#default",
      color_success_300: "#default",
      color_success_400: "#default",
      color_success_500: "#default",
      color_success_600: "#default",
      color_success_700: "#default",
      color_success_800: "#default",
      color_success_900: "#default",
      color_success_950: "#default",
      color_info_50: "#default",
      color_info_100: "#default",
      color_info_200: "#default",
      color_info_300: "#default",
      color_info_400: "#default",
      color_info_500: "#default",
      color_info_600: "#default",
      color_info_700: "#default",
      color_info_800: "#default",
      color_info_900: "#default",
      color_info_950: "#default",
      color_additional_50: "#default",
      color_additional_950: "#default",
    },
    coffee: {
      color_primary_50: "#coffee",
      color_primary_100: "#coffee",
      color_primary_200: "#coffee",
      color_primary_300: "#coffee",
      color_primary_400: "#coffee",
      color_primary_500: "#coffee",
      color_primary_600: "#coffee",
      color_primary_700: "#coffee",
      color_primary_800: "#coffee",
      color_primary_900: "#coffee",
      color_primary_950: "#coffee",
      color_secondary_50: "#coffee",
      color_secondary_100: "#coffee",
      color_secondary_200: "#coffee",
      color_secondary_300: "#coffee",
      color_secondary_400: "#coffee",
      color_secondary_500: "#coffee",
      color_secondary_600: "#coffee",
      color_secondary_700: "#coffee",
      color_secondary_800: "#coffee",
      color_secondary_900: "#coffee",
      color_secondary_950: "#coffee",
      color_accent_50: "#coffee",
      color_accent_100: "#coffee",
      color_accent_200: "#coffee",
      color_accent_300: "#coffee",
      color_accent_400: "#coffee",
      color_accent_500: "#coffee",
      color_accent_600: "#coffee",
      color_accent_700: "#coffee",
      color_accent_800: "#coffee",
      color_accent_900: "#coffee",
      color_accent_950: "#coffee",
      color_neutral_50: "#coffee",
      color_neutral_100: "#coffee",
      color_neutral_200: "#coffee",
      color_neutral_300: "#coffee",
      color_neutral_400: "#coffee",
      color_neutral_500: "#coffee",
      color_neutral_600: "#coffee",
      color_neutral_700: "#coffee",
      color_neutral_800: "#coffee",
      color_neutral_900: "#coffee",
      color_neutral_950: "#coffee",
      color_warning_50: "#coffee",
      color_warning_100: "#coffee",
      color_warning_200: "#coffee",
      color_warning_300: "#coffee",
      color_warning_400: "#coffee",
      color_warning_500: "#coffee",
      color_warning_600: "#coffee",
      color_warning_700: "#coffee",
      color_warning_800: "#coffee",
      color_warning_900: "#coffee",
      color_warning_950: "#coffee",
      color_danger_50: "#coffee",
      color_danger_100: "#coffee",
      color_danger_200: "#coffee",
      color_danger_300: "#coffee",
      color_danger_400: "#coffee",
      color_danger_500: "#coffee",
      color_danger_600: "#coffee",
      color_danger_700: "#coffee",
      color_danger_800: "#coffee",
      color_danger_900: "#coffee",
      color_danger_950: "#coffee",
      color_success_50: "#coffee",
      color_success_100: "#coffee",
      color_success_200: "#coffee",
      color_success_300: "#coffee",
      color_success_400: "#coffee",
      color_success_500: "#coffee",
      color_success_600: "#coffee",
      color_success_700: "#coffee",
      color_success_800: "#coffee",
      color_success_900: "#coffee",
      color_success_950: "#coffee",
      color_info_50: "#coffee",
      color_info_100: "#coffee",
      color_info_200: "#coffee",
      color_info_300: "#coffee",
      color_info_400: "#coffee",
      color_info_500: "#coffee",
      color_info_600: "#coffee",
      color_info_700: "#coffee",
      color_info_800: "#coffee",
      color_info_900: "#coffee",
      color_info_950: "#coffee",
      color_additional_50: "#coffee",
      color_additional_950: "#coffee",
    },
  },
}));

vi.mock("@/config/settings_data.json", () => ({
  default: {
    current: "default",
    settings: {},
  },
}));

async function importComposable() {
  const mod = await import("@/core/composables/useThemeContext");
  return mod;
}

describe("useThemeContext - preset loading functions", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    hoisted.dynamicPresetsCache.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = originalFetch;
  });

  describe("getPredefinedPreset", () => {
    it("returns preset when it exists in predefined presets", async () => {
      const { getPredefinedPreset } = await importComposable();

      const result = getPredefinedPreset("default");
      expect(result).not.toBeNull();
      expect(result?.color_primary_50).toBe("#default");
    });

    it("returns preset for coffee when it exists in predefined presets", async () => {
      const { getPredefinedPreset } = await importComposable();

      const result = getPredefinedPreset("coffee");
      expect(result).not.toBeNull();
      expect(result?.color_primary_50).toBe("#coffee");
    });

    it("returns null when preset does not exist in predefined presets", async () => {
      const { getPredefinedPreset } = await importComposable();

      const result = getPredefinedPreset("non-existent");
      expect(result).toBeNull();
    });
  });

  describe("loadPreset", () => {
    it("fetches preset from server when not in cache", async () => {
      const { loadPreset } = await importComposable();

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => hoisted.mockPreset,
      });

      const result = await loadPreset("custom-preset");
      expect(result).toEqual(hoisted.mockPreset);
      expect(globalThis.fetch).toHaveBeenCalledWith("/assets/presets/custom-preset.json");
    });

    it("returns cached preset when available", async () => {
      const { loadPreset } = await importComposable();

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => hoisted.mockPreset,
      });

      // First call to load and cache
      await loadPreset("cached-preset");

      // Clear the mock to verify it's not called again
      vi.clearAllMocks();

      // Second call should use cache
      const result = await loadPreset("cached-preset");
      expect(result).toEqual(hoisted.mockPreset);
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("returns null when fetch fails", async () => {
      const { loadPreset } = await importComposable();

      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const result = await loadPreset("failing-preset");
      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load preset "failing-preset"'),
        expect.any(Error),
      );

      consoleWarnSpy.mockRestore();
    });

    it("returns null when response is not ok", async () => {
      const { loadPreset } = await importComposable();

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
      });

      const result = await loadPreset("not-found-preset");
      expect(result).toBeNull();
    });
  });

  describe("getPreset", () => {
    it("returns predefined preset when it exists", async () => {
      const { getPreset } = await importComposable();

      globalThis.fetch = vi.fn();

      const result = await getPreset("default");
      expect(result).not.toBeNull();
      expect(result?.color_primary_50).toBe("#default");
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("returns dynamically loaded preset when not predefined", async () => {
      const { getPreset } = await importComposable();

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => hoisted.mockPreset,
      });

      const result = await getPreset("dynamic-preset");
      expect(result).toEqual(hoisted.mockPreset);
      expect(globalThis.fetch).toHaveBeenCalledWith("/assets/presets/dynamic-preset.json");
    });

    it("returns null when preset is not found anywhere", async () => {
      const { getPreset } = await importComposable();

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
      });

      const result = await getPreset("non-existent");
      expect(result).toBeNull();
    });
  });

  describe("addPresetToThemeContext - fallback logic", () => {
    it("uses requested preset when it exists", async () => {
      const { useThemeContext } = await importComposable();
      const { setThemeContext, addPresetToThemeContext, themeContext } = useThemeContext();

      globalThis.fetch = vi.fn();

      // Initialize theme context
      setThemeContext({
        id: "test-store",
        name: "Test Store",
        settings: {},
      } as unknown as StoreResponseType);

      // Add coffee preset which exists in predefined presets
      await addPresetToThemeContext("coffee");

      expect(themeContext.value.preset).not.toBeNull();
      expect(themeContext.value.preset?.color_primary_50).toBe("#coffee");
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("falls back to current preset when requested preset is not found", async () => {
      const { useThemeContext } = await importComposable();
      const { setThemeContext, addPresetToThemeContext, themeContext } = useThemeContext();

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
      });

      // Initialize theme context
      setThemeContext({
        id: "test-store",
        name: "Test Store",
        settings: {},
      } as unknown as StoreResponseType);

      // Try to add non-existent preset, should fallback to "default" (from settings_data.json)
      await addPresetToThemeContext("non-existent-preset");

      expect(themeContext.value.preset).not.toBeNull();
      expect(themeContext.value.preset?.color_primary_50).toBe("#default");
      expect(globalThis.fetch).toHaveBeenCalledWith("/assets/presets/non-existent-preset.json");
    });

    it("falls back to default preset when both requested and current presets are not found", async () => {
      const { useThemeContext } = await importComposable();
      const { setThemeContext, addPresetToThemeContext, themeContext } = useThemeContext();

      // Mock fetch to fail for all requests
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
      });

      // Mock getPreset to return null for non-default presets
      const getPresetModule = await import("@/core/composables/useThemeContext");

      vi.spyOn(getPresetModule, "getPreset").mockImplementation(async () => {
        // Simulate all presets not being found dynamically
        return null;
      });

      // Initialize theme context
      setThemeContext({
        id: "test-store",
        name: "Test Store",
        settings: {},
      } as unknown as StoreResponseType);

      // Try to add non-existent preset, should fallback through current to presets.default
      await addPresetToThemeContext("non-existent-preset");

      expect(themeContext.value.preset).not.toBeNull();
      expect(themeContext.value.preset?.color_primary_50).toBe("#default");

      // Restore original function
      vi.mocked(getPresetModule.getPreset).mockRestore();
    });

    it("throws error when theme context is not initialized", async () => {
      const { useThemeContext } = await importComposable();
      const { addPresetToThemeContext } = useThemeContext();

      await expect(addPresetToThemeContext("coffee")).rejects.toThrow("The global state should be defined");
    });
  });

  describe("integration", () => {
    it("prioritizes predefined presets over dynamic loading", async () => {
      const { getPredefinedPreset, getPreset } = await importComposable();

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => hoisted.mockPreset,
      });

      const predefinedResult = getPredefinedPreset("default");
      expect(predefinedResult).not.toBeNull();
      expect(predefinedResult?.color_primary_50).toBe("#default");

      // getPreset should return the predefined preset without calling fetch
      const result = await getPreset("default");
      expect(result).not.toBeNull();
      expect(result?.color_primary_50).toBe("#default");
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("loads preset dynamically when not predefined", async () => {
      const { getPredefinedPreset, loadPreset } = await importComposable();

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => hoisted.mockPreset,
      });

      const predefinedResult = getPredefinedPreset("dynamic-only");
      expect(predefinedResult).toBeNull();

      const dynamicResult = await loadPreset("dynamic-only");
      expect(dynamicResult).toEqual(hoisted.mockPreset);
      expect(globalThis.fetch).toHaveBeenCalledWith("/assets/presets/dynamic-only.json");
    });

    it("handles loading failures gracefully", async () => {
      const { loadPreset } = await importComposable();

      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const result = await loadPreset("completely-missing");
      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load preset "completely-missing"'),
        expect.any(Error),
      );

      consoleWarnSpy.mockRestore();
    });
  });
});
