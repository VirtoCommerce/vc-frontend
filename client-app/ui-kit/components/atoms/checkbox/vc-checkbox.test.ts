import { mount } from "@vue/test-utils";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { VcInputDetails } from "@/ui-kit/components/atoms";
import { INTERACTIVE_PARENT_KEY } from "@/ui-kit/components/molecules/menu-item/vc-menu-item-context";
import VcCheckbox from "./vc-checkbox.vue";
import type { ComponentMountingOptions } from "@vue/test-utils";

type MountOptionsType = ComponentMountingOptions<typeof VcCheckbox>;

const mountGlobal = {
  components: { VcInputDetails },
  stubs: { VcTooltip: { template: "<span><slot name='trigger' /></span>" }, VcIcon: true },
  directives: { "html-safe": {} },
};

/** `global` is spread over the defaults one level deep, which keeps the symbol keys of a `provide`. */
function mountCheckbox(props = {}, slots: MountOptionsType["slots"] = {}, global: MountOptionsType["global"] = {}) {
  return mount(VcCheckbox, {
    props: { name: "terms", ...props },
    slots,
    global: { ...mountGlobal, ...global },
  });
}

describe("VcCheckbox error state", () => {
  it("marks the input invalid and points it at the rendered message", () => {
    const wrapper = mountCheckbox({ error: true, message: "Accept the terms to continue" });
    const input = wrapper.get("input");
    const detailsId = wrapper.findComponent(VcInputDetails).attributes("id");

    expect(input.attributes("aria-invalid")).toBe("true");
    expect(detailsId).toBeTruthy();
    expect(input.attributes("aria-describedby")).toBe(detailsId);
  });

  it("sets neither attribute without an error or a message", () => {
    const input = mountCheckbox().get("input");

    expect(input.attributes("aria-invalid")).toBeUndefined();
    expect(input.attributes("aria-describedby")).toBeUndefined();
  });

  it("describes the input with a hint that is not an error", () => {
    const wrapper = mountCheckbox({ message: "Pick a branch first" });
    const input = wrapper.get("input");
    const detailsId = wrapper.findComponent(VcInputDetails).attributes("id");

    expect(input.attributes("aria-invalid")).toBeUndefined();
    expect(detailsId).toBeTruthy();
    expect(input.attributes("aria-describedby")).toBe(detailsId);
  });

  it("does not point at an empty details row", () => {
    const input = mountCheckbox({ error: true }).get("input");

    expect(input.attributes("aria-invalid")).toBe("true");
    expect(input.attributes("aria-describedby")).toBeUndefined();
  });

  it("gives every instance its own details id", () => {
    const first = mountCheckbox({ message: "First" }).get("input").attributes("aria-describedby");
    const second = mountCheckbox({ message: "Second" }).get("input").attributes("aria-describedby");

    expect(first).not.toBe(second);
  });
});

describe("VcCheckbox accessible name", () => {
  it("is named by the slot label, not by the form-field name", () => {
    const wrapper = mountCheckbox({ name: "billingAddressEqualsShipping" }, { default: "Same as shipping address" });
    const input = wrapper.get("input");

    expect(input.attributes("aria-label")).toBeUndefined();
    expect(input.attributes("name")).toBe("billingAddressEqualsShipping");
    expect(wrapper.get("label").text()).toBe("Same as shipping address");
  });

  it("falls back to the name when there is no slot label", () => {
    const wrapper = mountCheckbox({ name: "newsletter" });

    expect(wrapper.get("input").attributes("aria-label")).toBe("newsletter");
  });

  it.each([
    ["added", false],
    ["removed", true],
  ])("follows the slot label when it is %s after the first render", async (_, withLabel) => {
    const showLabel = ref(withLabel);
    const Host = defineComponent({
      setup: () => () => h(VcCheckbox, { name: "terms" }, showLabel.value ? { default: () => "Accept terms" } : {}),
    });
    const wrapper = mount(Host, { global: mountGlobal });

    showLabel.value = !withLabel;
    await nextTick();

    expect(wrapper.get("input").attributes("aria-label")).toBe(withLabel ? "terms" : undefined);
  });

  it("prefers ariaLabel over the slot label and the name", () => {
    const wrapper = mountCheckbox(
      { name: "newsletter", ariaLabel: "Subscribe to the newsletter" },
      { default: "Subscribe" },
    );

    expect(wrapper.get("input").attributes("aria-label")).toBe("Subscribe to the newsletter");
  });
});

describe("VcCheckbox exposed input", () => {
  it("exposes its native input", () => {
    const wrapper = mountCheckbox({ modelValue: false, ariaLabel: "Accept" });

    expect(wrapper.vm.inputElement).toBe(wrapper.get("input").element);
  });

  it("keeps the exposed input read-only for a parent", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    onTestFinished(() => warn.mockRestore());
    const wrapper = mountCheckbox({ modelValue: false, ariaLabel: "Accept" });

    // The instance type reads as writable; the computed behind it is not.
    wrapper.vm.inputElement = null;

    expect(wrapper.vm.inputElement).toBe(wrapper.get("input").element);
    expect(warn.mock.calls.map(([message]) => String(message))).toEqual([
      expect.stringContaining("computed value is readonly"),
    ]);
  });

  it("exposes null inside an interactive parent, which renders no input", () => {
    const wrapper = mountCheckbox(
      { modelValue: false, ariaLabel: "Accept" },
      {},
      { provide: { [INTERACTIVE_PARENT_KEY as symbol]: ref(true) } },
    );

    expect(wrapper.find("input").exists()).toBe(false);
    expect(wrapper.vm.inputElement).toBeNull();
  });
});

describe("VcCheckbox with prevent-default", () => {
  it.each([
    ["checks", false, true],
    ["clears", true, false],
  ])(
    "shows the new state after a click that %s, once the browser restores the cancelled one",
    async (_label, from, to) => {
      const wrapper = mountCheckbox({
        modelValue: from,
        ariaLabel: "Accept",
        preventDefault: true,
        "onUpdate:modelValue": (value: boolean) => void wrapper.setProps({ modelValue: value }),
      });
      const input = wrapper.get("input").element as HTMLInputElement;

      input.click();
      await nextTick();
      // A browser renders the new state before it restores the cancelled click's old one.
      input.checked = from;
      await new Promise((resolve) => setTimeout(resolve));

      expect(input.checked).toBe(to);
    },
  );
});
