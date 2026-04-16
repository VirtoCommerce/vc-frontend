import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import { VcButton, VcInput } from "@/ui-kit/components/molecules";
import VcDateSelector from "./vc-date-selector.vue";

const createWrapper = createWrapperFactory(mount, VcDateSelector, {
  global: {
    components: { VcInput, VcButton },
    stubs: {
      VcLabel: true,
      VcIcon: true,
      VcInputDetails: true,
    },
  },
});

function getInput(wrapper: ReturnType<typeof createWrapper>): HTMLInputElement {
  return wrapper.find("input[type='date']").element as HTMLInputElement;
}

async function triggerNativeInput(wrapper: ReturnType<typeof createWrapper>, value: string) {
  const input = getInput(wrapper);
  // Simulate native value change + input event (mirrors browser segment editing)
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  await wrapper.vm.$nextTick();
}

describe("VcDateSelector", () => {
  describe("@input event", () => {
    it("emits input event on native input with complete date", async () => {
      const wrapper = createWrapper();
      await triggerNativeInput(wrapper, "2026-04-16");

      const events = wrapper.emitted("input") as VcDateSelectorEventType[][];
      expect(events).toHaveLength(1);
      expect(events[0][0]).toEqual({
        value: "2026-04-16",
        complete: true,
        valid: true,
        eventSource: "input",
      });
    });

    it("emits input event with complete: false for empty value", async () => {
      const wrapper = createWrapper();
      await triggerNativeInput(wrapper, "");

      const events = wrapper.emitted("input") as VcDateSelectorEventType[][];
      expect(events).toHaveLength(1);
      expect(events[0][0]).toEqual({
        value: "",
        complete: false,
        valid: false,
        eventSource: "input",
      });
    });

    it("emits input event with valid: false when date is below min", async () => {
      const wrapper = createWrapper({
        props: { min: "2026-06-01" },
      });
      await triggerNativeInput(wrapper, "2026-04-16");

      const events = wrapper.emitted("input") as VcDateSelectorEventType[][];
      expect(events[0][0]).toMatchObject({
        complete: true,
        valid: false,
      });
    });

    it("emits input event with valid: false when date is above max", async () => {
      const wrapper = createWrapper({
        props: { max: "2026-03-01" },
      });
      await triggerNativeInput(wrapper, "2026-04-16");

      const events = wrapper.emitted("input") as VcDateSelectorEventType[][];
      expect(events[0][0]).toMatchObject({
        complete: true,
        valid: false,
      });
    });
  });

  describe("@change event", () => {
    it("emits change when date becomes complete (incomplete -> complete)", async () => {
      const wrapper = createWrapper();
      // First input: incomplete (no change expected)
      await triggerNativeInput(wrapper, "");
      expect(wrapper.emitted("change")).toBeUndefined();

      // Second input: complete date
      await triggerNativeInput(wrapper, "2026-04-16");
      const events = wrapper.emitted("change") as VcDateSelectorEventType[][];
      expect(events).toHaveLength(1);
      expect(events[0][0]).toEqual({
        value: "2026-04-16",
        complete: true,
        valid: true,
        eventSource: "input",
      });
    });

    it("emits change when complete date changes to another complete date", async () => {
      const wrapper = createWrapper({ props: { modelValue: "2026-04-16" } });

      await triggerNativeInput(wrapper, "2026-05-01");

      const events = wrapper.emitted("change") as VcDateSelectorEventType[][];
      expect(events).toHaveLength(1);
      expect(events[0][0]).toMatchObject({
        value: "2026-05-01",
        complete: true,
      });
    });

    it("emits change when complete date is cleared (complete -> incomplete)", async () => {
      const wrapper = createWrapper({ props: { modelValue: "2026-04-16" } });

      await triggerNativeInput(wrapper, "");

      const events = wrapper.emitted("change") as VcDateSelectorEventType[][];
      expect(events).toHaveLength(1);
      expect(events[0][0]).toEqual({
        value: "",
        complete: false,
        valid: false,
        eventSource: "input",
      });
    });

    it("does not emit change for incomplete -> incomplete", async () => {
      const wrapper = createWrapper();
      await triggerNativeInput(wrapper, "");
      await triggerNativeInput(wrapper, "");

      expect(wrapper.emitted("change")).toBeUndefined();
    });

    it("does not emit change when complete date stays the same", async () => {
      const wrapper = createWrapper({ props: { modelValue: "2026-04-16" } });

      await triggerNativeInput(wrapper, "2026-04-16");

      expect(wrapper.emitted("change")).toBeUndefined();
    });
  });

  describe("@blur event", () => {
    it("emits blur with current state when input loses focus", async () => {
      const wrapper = createWrapper({ props: { modelValue: "2026-04-16" } });
      const input = wrapper.find("input[type='date']");

      await input.trigger("blur");

      const events = wrapper.emitted("blur") as VcDateSelectorEventType[][];
      expect(events).toHaveLength(1);
      expect(events[0][0]).toEqual({
        value: "2026-04-16",
        complete: true,
        valid: true,
        eventSource: "blur",
      });
    });
  });

  describe("eventSource: picker", () => {
    it("emits change with eventSource 'picker' when calendar button triggers selection", async () => {
      const wrapper = createWrapper();

      // Simulate: calendar button clicked -> openCalendar sets pickerOpen flag
      // Then native input fires (as if user selected from picker)
      const calendarButton = wrapper.find("button");
      await calendarButton.trigger("click");

      // Simulate picker selection arriving as native input event
      await triggerNativeInput(wrapper, "2026-04-16");

      const events = wrapper.emitted("change") as VcDateSelectorEventType[][];
      expect(events).toHaveLength(1);
      expect(events[0][0]).toMatchObject({
        eventSource: "picker",
      });
    });

    it("resets eventSource to 'input' after keydown following cancelled picker", async () => {
      const wrapper = createWrapper();
      const input = wrapper.find("input[type='date']");

      // Open picker
      const calendarButton = wrapper.find("button");
      await calendarButton.trigger("click");

      // User cancels picker and starts typing (keydown resets flag)
      await input.trigger("keydown");

      // Keyboard input arrives
      await triggerNativeInput(wrapper, "2026-04-16");

      const events = wrapper.emitted("change") as VcDateSelectorEventType[][];
      expect(events).toHaveLength(1);
      expect(events[0][0]).toMatchObject({
        eventSource: "input",
      });
    });
  });
});
