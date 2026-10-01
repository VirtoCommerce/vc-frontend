import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import VcButton from "./vc-button.vue";

describe("VcButton loading state (VCST-6096)", () => {
  it("marks the button busy and keeps the slot label while loading", () => {
    const wrapper = mount(VcButton, { props: { loading: true }, slots: { default: "Browse files" } });

    expect(wrapper.attributes("aria-busy")).toBe("true");
    expect(wrapper.find(".vc-button__slot").text()).toBe("Browse files");
  });

  it("does not set aria-busy when not loading", () => {
    const wrapper = mount(VcButton, { slots: { default: "Browse files" } });

    expect(wrapper.attributes("aria-busy")).toBeUndefined();
  });
});
