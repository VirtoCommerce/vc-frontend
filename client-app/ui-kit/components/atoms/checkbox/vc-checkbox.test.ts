import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { VcInputDetails } from "@/ui-kit/components/atoms";
import VcCheckbox from "./vc-checkbox.vue";
import type { ComponentMountingOptions } from "@vue/test-utils";

const mountGlobal = {
  components: { VcInputDetails },
  stubs: { VcTooltip: { template: "<span><slot name='trigger' /></span>" }, VcIcon: true },
  directives: { "html-safe": {} },
};

function mountCheckbox(props = {}, slots: ComponentMountingOptions<typeof VcCheckbox>["slots"] = {}) {
  return mount(VcCheckbox, {
    props: { name: "terms", ...props },
    slots,
    global: mountGlobal,
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
