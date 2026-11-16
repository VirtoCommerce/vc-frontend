import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import { VcTabSwitch } from "@/ui-kit/components/molecules";

const createWrapper = createWrapperFactory(mount, VcTabSwitch, {
  global: {
    stubs: {
      VcIcon: true,
    },
  },
});

describe("VcTabSwitch", () => {
  // The radio is display:none, so nothing announced the selection before VCST-5890.
  describe("selected state", () => {
    it("announces the selection on the visible button", () => {
      const wrapper = createWrapper({ props: { value: "grid", modelValue: "grid" } });

      expect(wrapper.get("button").attributes("aria-pressed")).toBe("true");
    });

    it("announces an unselected tab as not pressed", () => {
      const wrapper = createWrapper({ props: { value: "grid", modelValue: "list" } });

      expect(wrapper.get("button").attributes("aria-pressed")).toBe("false");
    });
  });

  describe("without a group", () => {
    it("is a tab stop with no radio semantics", () => {
      const wrapper = createWrapper({ props: { value: "grid", modelValue: "grid", name: "view" } });
      const button = wrapper.get("button");

      expect(button.attributes("tabindex")).toBe("0");
      expect(button.attributes("role")).toBeUndefined();
      expect(button.attributes("aria-checked")).toBeUndefined();
      expect(wrapper.get("input").attributes("name")).toBe("view");
    });

    it("stays a tab stop with no aria-disabled when disabled", () => {
      const wrapper = createWrapper({ props: { value: "grid", disabled: true } });
      const button = wrapper.get("button");

      expect(button.attributes("tabindex")).toBe("0");
      expect(button.attributes("aria-disabled")).toBeUndefined();
    });
  });
});
