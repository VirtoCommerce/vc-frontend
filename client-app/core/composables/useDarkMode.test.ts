import { describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { useDarkMode } from "./useDarkMode";

describe("useDarkMode", () => {
  it("shows an overriding scheme without saving it as the visitor's choice", async () => {
    localStorage.setItem("vc-color-mode", "light");
    const { isDark, colorMode, setActivePreset, setColorModeOverride } = useDarkMode();
    setActivePreset("default", true);

    setColorModeOverride("dark");
    await nextTick();

    expect(isDark.value).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(colorMode.value).toBe("light");
    expect(localStorage.getItem("vc-color-mode")).toBe("light");
  });
});
