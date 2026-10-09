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
});
