import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { createWrapperFactory } from "@/core/utilities/tests";
import { VcInputDetails } from "@/ui-kit/components/atoms";
import { VcButton, VcInput } from "@/ui-kit/components/molecules";
import { VcQuantityStepper } from "@/ui-kit/components/organisms";
import QuantityControl from "./quantity-control.vue";

const createWrapper = createWrapperFactory(mount, QuantityControl, {
  global: {
    components: { VcQuantityStepper, VcInput, VcInputDetails, VcButton },
    // The stepper asks for a single-line message, which VcInputDetails renders through the
    // tooltip's trigger slot — a bare stub would swallow the very text this suite asserts on.
    stubs: { VcLabel: true, VcIcon: true, VcTooltip: { template: '<div><slot name="trigger" /></div>' } },
  },
});

// A row of the featured-SKU mission modal: a product with a minimum order quantity, nothing in cart.
const stepperRow = {
  mode: "stepper" as const,
  modelValue: 0,
  minQuantity: 3,
  allowZero: true,
  isActive: true,
  isAvailable: true,
  isBuyable: true,
  isInStock: true,
};

async function settle() {
  await new Promise((resolve) => setTimeout(resolve, 50));
  await nextTick();
}

// VCST-5912: the stepper published the product minimum as the input's own bound, so an untouched 0
// was a constraint violation and assistive tech heard an invalid entry before any interaction.
describe("QuantityControl in stepper mode", () => {
  it("leaves an untouched zero-quantity row valid", async () => {
    const input = createWrapper({ props: stepperRow }).get("input");
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("0");
    expect(input.attributes("aria-valuenow")).toBe("0");
    expect((input.element as HTMLInputElement).validity.rangeUnderflow).toBe(false);
    expect(input.attributes("aria-invalid")).toBeUndefined();
  });

  it("announces no ceiling when the product has neither a maximum nor known stock", async () => {
    const input = createWrapper({ props: stepperRow }).get("input");
    await nextTick();

    expect(input.attributes("aria-valuemax")).toBeUndefined();
  });

  it("announces available stock as the ceiling when the product has it", async () => {
    const input = createWrapper({ props: { ...stepperRow, availableQuantity: 7 } }).get("input");
    await nextTick();

    expect(input.attributes("aria-valuemax")).toBe("7");
  });

  it("still rejects a quantity between zero and the product minimum", async () => {
    const wrapper = createWrapper({ props: stepperRow });
    await wrapper.get("input").setValue(2);
    await settle();

    expect(wrapper.emitted("update:validation")?.at(-1)?.[0]).toMatchObject({ isValid: false });
  });

  it("accepts zero as a quantity", async () => {
    const wrapper = createWrapper({ props: { ...stepperRow, modelValue: 3 } });
    await wrapper.get("input").setValue(0);
    await settle();

    expect(wrapper.emitted("update:validation")?.at(-1)?.[0]).toMatchObject({ isValid: true });
  });

  it("announces the invalid state with the message that explains it", async () => {
    const wrapper = createWrapper({ props: stepperRow });
    await wrapper.get("input").setValue(2);
    await settle();

    const input = wrapper.get("input");
    const describedBy = input.attributes("aria-describedby");

    expect(input.attributes("aria-invalid")).toBe("true");
    expect(describedBy).toBeTruthy();
    expect(wrapper.find(`#${describedBy}`).text()).not.toBe("");
  });
});
