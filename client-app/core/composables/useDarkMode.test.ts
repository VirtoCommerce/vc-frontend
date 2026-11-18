import { describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { useDarkMode } from "./useDarkMode";

describe("useDarkMode", () => {
  it("shows an overriding scheme without saving it as the visitor's choice", async () => {
    localStorage.setItem("vc-color-mode", "light");
    const { isDark, colorMode, setActivePreset, setColorModeOverride } = useDarkMode();
    setActivePreset(true);

    setColorModeOverride("dark");
    await nextTick();

    expect(isDark.value).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(colorMode.value).toBe("light");
    expect(localStorage.getItem("vc-color-mode")).toBe("light");
  });

  it("still takes a preset name, available only for a preset with a dark variant", () => {
    const { isDarkModeAvailable, setActivePreset } = useDarkMode();

    // eslint-disable-next-line sonarjs/deprecation -- the deprecated signature is what this test covers
    setActivePreset("coffee");
    expect(isDarkModeAvailable.value).toBe(true);

    // eslint-disable-next-line sonarjs/deprecation -- the deprecated signature is what this test covers
    setActivePreset("no-such-preset");
    expect(isDarkModeAvailable.value).toBe(false);
  });
});
