import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import VcCheckbox from "./vc-checkbox.vue";
import type { ComponentMountingOptions } from "@vue/test-utils";

function mountCheckbox(options: ComponentMountingOptions<typeof VcCheckbox> = {}) {
  return mount(VcCheckbox, {
    ...options,
    global: {
      stubs: {
        VcInputDetails: true,
        VcTooltip: { template: "<span><slot name='trigger' /></span>" },
      },
    },
  });
}

describe("VcCheckbox accessible name", () => {
  it("is named by the slot label, not by the form-field name", () => {
    const wrapper = mountCheckbox({
      props: { name: "billingAddressEqualsShipping" },
      slots: { default: "Same as shipping address" },
    });
    const input = wrapper.get("input");

    expect(input.attributes("aria-label")).toBeUndefined();
    expect(input.attributes("name")).toBe("billingAddressEqualsShipping");
    expect(wrapper.get("label").text()).toBe("Same as shipping address");
  });

  it("falls back to the name when there is no slot label", () => {
    const wrapper = mountCheckbox({ props: { name: "newsletter" } });

    expect(wrapper.get("input").attributes("aria-label")).toBe("newsletter");
  });

  it.each([
    ["added", false],
    ["removed", true],
  ])("follows the slot label when it is %s after the first render", async (_, withLabel) => {
    const showLabel = ref(withLabel);
    const Host = defineComponent({
      render: () => h(VcCheckbox, { name: "terms" }, showLabel.value ? { default: () => "Accept terms" } : {}),
    });
    const wrapper = mount(Host, {
      global: { stubs: { VcInputDetails: true, VcTooltip: { template: "<span><slot name='trigger' /></span>" } } },
    });

    showLabel.value = !withLabel;
    await nextTick();

    expect(wrapper.get("input").attributes("aria-label")).toBe(withLabel ? "terms" : undefined);
  });

  it("prefers ariaLabel over the slot label and the name", () => {
    const wrapper = mountCheckbox({
      props: { name: "newsletter", ariaLabel: "Subscribe to the newsletter" },
      slots: { default: "Subscribe" },
    });

    expect(wrapper.get("input").attributes("aria-label")).toBe("Subscribe to the newsletter");
  });
});
