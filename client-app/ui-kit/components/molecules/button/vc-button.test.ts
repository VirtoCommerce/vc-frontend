import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import VcButton from "./vc-button.vue";
import type { ComponentMountingOptions } from "@vue/test-utils";

function mountButton(options: ComponentMountingOptions<typeof VcButton> = {}) {
  return mount(VcButton, { ...options, global: { stubs: { VcIcon: true } } });
}

describe("VcButton", () => {
  describe("loading state", () => {
    it("marks the button busy and disabled and keeps the slot label", () => {
      const wrapper = mountButton({ props: { loading: true }, slots: { default: "Browse files" } });

      expect(wrapper.attributes("aria-busy")).toBe("true");
      expect(wrapper.attributes("disabled")).toBeDefined();
      expect(wrapper.find(".vc-button__slot").text()).toBe("Browse files");
    });

    it.each([
      ["ariaLabel", { ariaLabel: "Add to cart" }, "Add to cart"],
      ["title", { title: "Remove item" }, "Remove item"],
    ])("keeps the %s as the accessible name", (_, props, expected) => {
      const wrapper = mountButton({ props: { ...props, icon: "cart", loading: true } });

      expect(wrapper.attributes("aria-label")).toBe(expected);
      expect(wrapper.attributes("aria-busy")).toBe("true");
    });

    it.each([
      ["to", { to: "/cart" }],
      ["externalLink", { externalLink: "https://example.com" }],
    ])("renders a busy disabled button instead of a %s link", (_, props) => {
      const wrapper = mountButton({ props: { ...props, loading: true }, slots: { default: "Open" } });

      expect(wrapper.element.tagName).toBe("BUTTON");
      expect(wrapper.attributes("disabled")).toBeDefined();
      expect(wrapper.attributes("aria-busy")).toBe("true");
      expect(wrapper.attributes("href")).toBeUndefined();
    });
  });

  it("does not set aria-busy when not loading", () => {
    const wrapper = mountButton({ slots: { default: "Browse files" } });

    expect(wrapper.attributes("aria-busy")).toBeUndefined();
  });
});
