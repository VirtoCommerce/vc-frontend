import { mount } from "@vue/test-utils";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import { ref } from "vue";
import { createWrapperFactory } from "@/core/utilities/tests";
import { INTERACTIVE_PARENT_KEY } from "@/ui-kit/components/molecules/menu-item/vc-menu-item-context";
import VcCheckbox from "./vc-checkbox.vue";

const STUBS = { VcTooltip: true, VcInputDetails: true };
const createWrapper = createWrapperFactory(mount, VcCheckbox, { global: { stubs: STUBS } });

describe("VcCheckbox exposed input", () => {
  it("exposes its native input", () => {
    const wrapper = createWrapper({ props: { modelValue: false, ariaLabel: "Accept" } });

    expect(wrapper.vm.inputElement).toBe(wrapper.get("input").element);
  });

  it("keeps the exposed input read-only for a parent", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    onTestFinished(() => warn.mockRestore());
    const wrapper = createWrapper({ props: { modelValue: false, ariaLabel: "Accept" } });

    (wrapper.vm as { inputElement: HTMLInputElement | null }).inputElement = null;

    expect(wrapper.vm.inputElement).toBe(wrapper.get("input").element);
    expect(warn.mock.calls.map(([message]) => String(message))).toEqual([
      expect.stringContaining("computed value is readonly"),
    ]);
  });

  it("exposes null inside an interactive parent, which renders no input", () => {
    // Mounted directly: the factory's deep merge drops symbol keys from `provide`.
    const wrapper = mount(VcCheckbox, {
      props: { modelValue: false, ariaLabel: "Accept" },
      global: { stubs: STUBS, provide: { [INTERACTIVE_PARENT_KEY as symbol]: ref(true) } },
    });

    expect(wrapper.find("input").exists()).toBe(false);
    expect(wrapper.vm.inputElement).toBeNull();
  });
});
