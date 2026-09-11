import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import { VcInputDetails } from "@/ui-kit/components/atoms";
import { VcButton, VcInput } from "@/ui-kit/components/molecules";
import { VcQuantityStepper } from "@/ui-kit/components/organisms";

const createWrapper = createWrapperFactory(mount, VcQuantityStepper, {
  global: {
    components: {
      VcInput,
      VcInputDetails,
      VcButton,
    },
    stubs: {
      VcLabel: true,
      VcIcon: true,
      VcTooltip: true,
    },
  },
});

// VCST-5912: `min` is the stepping floor, not the range the control accepts — publishing it as the
// input's bound made an untouched 0 read to assistive tech as an invalid entry clamped up to `min`.
describe("VcQuantityStepper bounds", () => {
  describe("with allowZero (the default)", () => {
    it("announces 0 as the floor even when the stepping floor is higher", () => {
      const input = createWrapper({ props: { modelValue: 0, min: 3 } }).get("input");

      expect(input.attributes("min")).toBe("0");
      expect(input.attributes("aria-valuemin")).toBe("0");
    });

    it("announces the rendered value on an untouched render", () => {
      const input = createWrapper({ props: { modelValue: 0, min: 3 } }).get("input");

      expect((input.element as HTMLInputElement).value).toBe("0");
      expect(input.attributes("aria-valuenow")).toBe("0");
    });

    it("leaves an untouched 0 within the input's own bounds", () => {
      const input = createWrapper({ props: { modelValue: 0, min: 3 } }).get("input");

      expect((input.element as HTMLInputElement).validity.rangeUnderflow).toBe(false);
    });

    it("announces no value at all while the field is empty", () => {
      const input = createWrapper({ props: { modelValue: undefined, min: 3 } }).get("input");

      expect((input.element as HTMLInputElement).value).toBe("");
      expect(input.attributes("aria-valuenow")).toBeUndefined();
    });

    it("still steps down to the stepping floor before reaching 0", async () => {
      const wrapper = createWrapper({ props: { modelValue: 6, min: 3, step: 3 } });

      await wrapper.get(".vc-quantity-stepper__decrement").trigger("click");

      expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([3]);
    });
  });

  describe("without allowZero", () => {
    it("announces the stepping floor as the floor", () => {
      const input = createWrapper({ props: { modelValue: 3, min: 3, allowZero: false } }).get("input");

      expect(input.attributes("min")).toBe("3");
      expect(input.attributes("aria-valuemin")).toBe("3");
    });

    it("falls back to 1 when no floor is given", () => {
      const input = createWrapper({ props: { modelValue: 1, allowZero: false } }).get("input");

      expect(input.attributes("min")).toBe("1");
      expect(input.attributes("aria-valuemin")).toBe("1");
    });
  });

  describe("upper bound", () => {
    it("announces nothing when the consumer has no limit to report", () => {
      const input = createWrapper({ props: { modelValue: 0 } }).get("input");

      expect(input.attributes("max")).toBeUndefined();
      expect(input.attributes("aria-valuemax")).toBeUndefined();
    });

    it("announces the consumer's limit when there is one", () => {
      const input = createWrapper({ props: { modelValue: 0, max: 12 } }).get("input");

      expect(input.attributes("max")).toBe("12");
      expect(input.attributes("aria-valuemax")).toBe("12");
    });

    it("keeps stepping up without a consumer limit", async () => {
      const wrapper = createWrapper({ props: { modelValue: 5 } });

      await wrapper.get(".vc-quantity-stepper__increment").trigger("click");

      expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([6]);
    });
  });
});
