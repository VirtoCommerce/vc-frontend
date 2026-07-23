import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { VcInputDetails } from "@/ui-kit/components/atoms";
import VcDateInput from "../date-input/vc-date-input.vue";
import VcInput from "../input/vc-input.vue";
import VcDateRangeInput from "./vc-date-range-input.vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (k: string) => k, locale: { value: "en" } }) }));

const stubs = { VcLabel: true, VcIcon: true, VcTooltip: true, VcButton: true };

function mountInput(props = {}, options: { attachTo?: Element } = {}) {
  return mount(VcDateRangeInput, {
    props: { modelValue: undefined, mask: true, ...props },
    global: { components: { VcDateInput, VcInput, VcInputDetails }, stubs, directives: { "html-safe": {} } },
    ...options,
  });
}

describe("VcDateRangeInput", () => {
  it("renders exactly two date-input segments", () => {
    const wrapper = mountInput();
    expect(wrapper.findAllComponents({ name: "VcDateInput" }).length).toBe(2);
  });

  it("renders exactly one details row (segments hide theirs)", () => {
    const wrapper = mountInput({ error: true, message: "bad" });
    expect(wrapper.findAllComponents({ name: "VcInputDetails" }).length).toBe(1);
  });

  it("emits update:valid=true for an empty range on mount", () => {
    const wrapper = mountInput();
    expect(wrapper.emitted("update:valid")?.at(-1)?.[0]).toBe(true);
  });

  it("emits a merged VcDateRange when the start segment commits", async () => {
    const wrapper = mountInput();
    const [startSeg] = wrapper.findAllComponents({ name: "VcDateInput" });
    startSeg.vm.$emit("update:modelValue", "2026-10-08");
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual({ start: "2026-10-08", end: undefined });
  });

  it("flags update:valid=false when start > end", async () => {
    const wrapper = mountInput({ modelValue: { start: "2026-10-20", end: "2026-10-01" } });
    // both segments format-valid, but order is wrong
    expect(wrapper.emitted("update:valid")?.at(-1)?.[0]).toBe(false);
  });

  it("clears both halves via the single shell clear", async () => {
    const wrapper = mountInput({ modelValue: { start: "2026-10-08", end: "2026-10-14" }, clearable: true });
    await wrapper.find(".vc-date-range-input__clear").trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toBeUndefined();
    expect(wrapper.emitted("clear")).toBeTruthy();
  });

  describe("focus/blur shell boundary", () => {
    it("emits focus exactly once when focus enters the shell from outside", () => {
      const outside = document.createElement("button");
      document.body.appendChild(outside);
      outside.focus();

      const wrapper = mountInput({}, { attachTo: document.body });
      const [startInput] = wrapper.findAll("input");
      startInput.element.focus();

      expect(wrapper.emitted("focus")).toHaveLength(1);
      expect(wrapper.emitted("blur")).toBeUndefined();

      wrapper.unmount();
      outside.remove();
    });

    it("emits no blur/focus when focus moves between the two segments", () => {
      const wrapper = mountInput({}, { attachTo: document.body });
      const [startInput, endInput] = wrapper.findAll("input");

      startInput.element.focus();
      expect(wrapper.emitted("focus")).toHaveLength(1);

      endInput.element.focus();

      expect(wrapper.emitted("focus")).toHaveLength(1);
      expect(wrapper.emitted("blur")).toBeUndefined();

      wrapper.unmount();
    });

    it("emits blur exactly once when focus leaves the shell to an outside element", () => {
      const outside = document.createElement("button");
      document.body.appendChild(outside);

      const wrapper = mountInput({}, { attachTo: document.body });
      const [startInput] = wrapper.findAll("input");

      startInput.element.focus();
      outside.focus();

      expect(wrapper.emitted("focus")).toHaveLength(1);
      expect(wrapper.emitted("blur")).toHaveLength(1);

      wrapper.unmount();
      outside.remove();
    });
  });
});
