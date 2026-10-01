import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import { VcInputDetails, VcLabel } from "@/ui-kit/components/atoms";
import VcTextarea from "./vc-textarea.vue";

// VcLabel is real: the element it renders is what this suite asserts.
const createWrapper = createWrapperFactory(mount, VcTextarea, {
  global: { components: { VcInputDetails, VcLabel }, stubs: { VcTooltip: true, VcIcon: true } },
});

describe("VcTextarea accessible name", () => {
  it("renders a real label bound to the field", () => {
    const wrapper = createWrapper({ props: { label: "Delivery notes" } });
    const label = wrapper.get(".vc-label");

    expect(label.element.tagName).toBe("LABEL");
    expect(label.attributes("for")).toBe(wrapper.get("textarea").attributes("id"));
  });

  it("never points the field at itself", () => {
    const wrapper = createWrapper({ props: { label: "Delivery notes" } });
    const textarea = wrapper.get("textarea");

    expect(textarea.attributes("id")).toBeTruthy();
    expect(textarea.attributes("aria-labelledby")).toBeUndefined();
  });

  it("keeps ariaLabel when there is no label", () => {
    const wrapper = createWrapper({ props: { ariaLabel: "Order comment" } });

    expect(wrapper.find(".vc-label").exists()).toBe(false);
    expect(wrapper.get("textarea").attributes("aria-label")).toBe("Order comment");
  });
});
