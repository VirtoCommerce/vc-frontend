import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import VcLabel from "./vc-label.vue";

const createWrapper = createWrapperFactory(mount, VcLabel, { slots: { default: "Comment" } });

describe("VcLabel required asterisk", () => {
  it("hides the asterisk from assistive tech when bound to a control", () => {
    const wrapper = createWrapper({ props: { required: true, forId: "comment" } });

    expect(wrapper.element.tagName).toBe("LABEL");
    expect(wrapper.get(".vc-label__asterisk").attributes("aria-hidden")).toBe("true");
  });

  it("keeps the asterisk audible on a group label without a control", () => {
    const wrapper = createWrapper({ props: { required: true } });

    expect(wrapper.element.tagName).toBe("DIV");
    expect(wrapper.get(".vc-label__asterisk").attributes("aria-hidden")).toBeUndefined();
  });

  it("renders no asterisk when not required", () => {
    const wrapper = createWrapper({ props: { forId: "comment" } });

    expect(wrapper.find(".vc-label__asterisk").exists()).toBe(false);
  });
});
