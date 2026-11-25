import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VcTabSwitch, VcTabSwitchGroup } from "@/ui-kit/components/molecules";
import ColorModeSwitch from "./color-mode-switch.vue";

const { colorMode } = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return { colorMode: ref<"light" | "dark" | "system">("system") };
});

vi.mock("@/core/composables/useDarkMode", () => ({
  useDarkMode: () => ({ colorMode }),
}));

enableAutoUnmount(afterEach);

function mountSwitch(attrs: Record<string, string> = {}) {
  return mount(ColorModeSwitch, {
    attrs,
    attachTo: document.body,
    global: {
      components: { VcTabSwitch, VcTabSwitchGroup },
      stubs: { VcIcon: true },
      mocks: { $t: (key: string) => key },
    },
  });
}

function radio(wrapper: ReturnType<typeof mountSwitch>, mode: string) {
  return wrapper.get(`[data-test-id="preferences-menu-color-mode-${mode}"] [role="radio"]`);
}

beforeEach(() => {
  colorMode.value = "system";
});

describe("ColorModeSwitch", () => {
  it("checks the stored colour mode", () => {
    colorMode.value = "dark";

    const wrapper = mountSwitch();

    expect(["light", "dark", "system"].map((mode) => radio(wrapper, mode).attributes("aria-checked"))).toEqual([
      "false",
      "true",
      "false",
    ]);
  });

  it("stores the chosen colour mode", async () => {
    const wrapper = mountSwitch();

    await radio(wrapper, "light").trigger("click");

    expect(colorMode.value).toBe("light");
  });

  it("takes its name from the heading the panel points it to", () => {
    const wrapper = mountSwitch({ "aria-labelledby": "appearance-heading" });

    expect(wrapper.get('[role="radiogroup"]').attributes("aria-labelledby")).toBe("appearance-heading");
  });
});
