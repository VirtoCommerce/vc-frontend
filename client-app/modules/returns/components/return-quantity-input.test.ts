import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import ReturnQuantityInput from "./return-quantity-input.vue";

// A plain input in VcInput's place: like VcInput, it is rewritten only when the value it is given changes.
const VcInput = {
  props: ["modelValue"],
  emits: ["update:modelValue", "blur", "keyup"],
  template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
};

describe("return-quantity-input", () => {
  it("shows the maximum rather than the number typed past it", async () => {
    // A 0 typed after the 5 already there: corrected in the same tick, the field got back the 5 it had,
    // was never rewritten, and kept showing 50 of 5 available.
    const wrapper = mount(ReturnQuantityInput, {
      props: { modelValue: 5, max: 5, label: "Quantity" },
      global: { stubs: { VcInput } },
    });
    const input = wrapper.find("input");

    await input.setValue("50");
    await flushPromises();

    expect(input.element.value).toBe("5");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([5]);
  });
});
