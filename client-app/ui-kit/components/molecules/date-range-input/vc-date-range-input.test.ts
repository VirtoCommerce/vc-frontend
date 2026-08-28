import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";
import { VcInputDetails, VcLabel } from "@/ui-kit/components/atoms";
import VcButton from "../button/vc-button.vue";
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
    expect(wrapper.findAllComponents({ name: "VcDateInput" })).toHaveLength(2);
  });

  it("falls back to default accessible names when startLabel/endLabel are omitted", () => {
    const inputs = mountInput().findAll("input");
    expect(inputs.map((input) => input.attributes("aria-label"))).toEqual([
      "ui_kit.date_range_input.start_date",
      "ui_kit.date_range_input.end_date",
    ]);
  });

  it("prefers the caller's startLabel/endLabel as the segment names", () => {
    const inputs = mountInput({ startLabel: "From", endLabel: "To" }).findAll("input");
    expect(inputs.map((input) => input.attributes("aria-label"))).toEqual(["From", "To"]);
  });

  it("renders exactly one details row (segments hide theirs)", () => {
    const wrapper = mountInput({ error: true, message: "bad" });
    expect(wrapper.findAllComponents({ name: "VcInputDetails" })).toHaveLength(1);
  });

  it("emits update:valid=true for an empty range on mount", () => {
    const wrapper = mountInput();
    expect(wrapper.emitted("update:valid")?.at(-1)?.[0]).toBe(true);
  });

  it("emits a merged VcDateRangeType when the start segment commits", async () => {
    const wrapper = mountInput();
    const [startSeg] = wrapper.findAllComponents({ name: "VcDateInput" });
    startSeg.vm.$emit("update:modelValue", "2026-10-08");
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual({ start: "2026-10-08", end: undefined });
  });

  it("emits a merged VcDateRangeType when the end segment commits", async () => {
    const wrapper = mountInput({ modelValue: { start: "2026-10-08", end: undefined } });
    const [, endSeg] = wrapper.findAllComponents({ name: "VcDateInput" });
    endSeg.vm.$emit("update:modelValue", "2026-10-14");
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual({ start: "2026-10-08", end: "2026-10-14" });
  });

  it("flags update:valid=false when start > end", async () => {
    const wrapper = mountInput({ modelValue: { start: "2026-10-20", end: "2026-10-01" } });
    expect(wrapper.emitted("update:valid")?.at(-1)?.[0]).toBe(false);
  });

  it("returns focus to the start input on clear instead of emitting a false blur", async () => {
    const parent = mount(
      defineComponent({
        components: { VcDateRangeInput },

        setup() {
          const range = ref<VcDateRangeType | undefined>({ start: "2026-10-08", end: "2026-10-14" });
          const blurs = ref(0);
          return { range, blurs };
        },

        template: `<VcDateRangeInput v-model="range" clearable @blur="blurs++" />`,
      }),
      {
        global: {
          components: { VcDateInput, VcInput, VcInputDetails, VcButton },
          stubs: { VcLabel: true, VcIcon: true, VcTooltip: true },
          directives: { "html-safe": {} },
          mocks: { $t: (key: string) => key },
        },
        attachTo: document.body,
      },
    );

    const [startInput] = parent.findAll("input");
    startInput.element.focus();

    const clearButton = parent.find<HTMLButtonElement>(".vc-date-range-input__clear");
    clearButton.element.focus();
    await clearButton.trigger("click");
    await flushPromises();

    expect(parent.vm.range).toBeUndefined();
    expect(document.activeElement).toBe(startInput.element);
    expect(parent.vm.blurs).toBe(0);

    parent.unmount();
  });

  it("clears both halves via the single shell clear", async () => {
    const wrapper = mountInput({ modelValue: { start: "2026-10-08", end: "2026-10-14" }, clearable: true });
    await wrapper.find(".vc-date-range-input__clear").trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toBeUndefined();
    expect(wrapper.emitted("clear")).toBeTruthy();
  });

  it("offers the clear button for uncommitted garbage despite an empty model, and clears the displays", async () => {
    const wrapper = mountInput({ clearable: true });
    expect(wrapper.find(".vc-date-range-input__clear").exists()).toBe(false);

    const [startInput] = wrapper.findAll("input");
    await startInput.setValue("99/99/9999");

    const clearButton = wrapper.find(".vc-date-range-input__clear");
    expect(clearButton.exists()).toBe(true);

    await clearButton.trigger("click");
    await flushPromises();

    expect(wrapper.findAll("input").map((input) => input.element.value)).toEqual(["", ""]);
    expect(wrapper.emitted("update:modelValue")).toEqual([[undefined]]);
  });

  // A segment already holding an undefined model sees no prop change on clear, so nothing resyncs it.
  it("drops uncommitted invalid text in an already-empty segment on clear", async () => {
    const parent = mount(
      defineComponent({
        components: { VcDateRangeInput },

        setup() {
          const range = ref<VcDateRangeType | undefined>({ start: "2026-10-08", end: undefined });
          const modelEmits = ref(0);
          const valid = ref(true);
          function onUpdate(value: VcDateRangeType | undefined): void {
            modelEmits.value++;
            range.value = value;
          }
          return { range, modelEmits, valid, onUpdate };
        },

        template: `<VcDateRangeInput
          :model-value="range"
          clearable
          @update:model-value="onUpdate"
          @update:valid="valid = $event"
        />`,
      }),
      { global: { components: { VcDateInput, VcInput, VcInputDetails }, stubs, directives: { "html-safe": {} } } },
    );

    const [, endInput] = parent.findAll("input");
    await endInput.setValue("99/99/9999");
    await endInput.trigger("blur");
    expect(parent.vm.valid).toBe(false);

    const modelEmitsBeforeClear = parent.vm.modelEmits;

    await parent.find(".vc-date-range-input__clear").trigger("click");
    await flushPromises();

    expect(parent.findAll("input").map((input) => input.element.value)).toEqual(["", ""]);
    expect(parent.vm.valid).toBe(true);
    expect(parent.vm.modelEmits - modelEmitsBeforeClear).toBe(1);
  });

  describe("segment fill-state width", () => {
    it("adds --filled only to the segment whose half of the model is set", () => {
      const wrapper = mountInput({ modelValue: { start: "2026-10-08", end: undefined } });
      const [startSeg, endSeg] = wrapper.findAllComponents({ name: "VcDateInput" });
      expect(startSeg.classes()).toContain("vc-date-range-input__segment--filled");
      expect(endSeg.classes()).not.toContain("vc-date-range-input__segment--filled");
    });

    it("marks both segments --filled for a full range", () => {
      const wrapper = mountInput({ modelValue: { start: "2026-10-08", end: "2026-10-14" } });
      const [startSeg, endSeg] = wrapper.findAllComponents({ name: "VcDateInput" });
      expect(startSeg.classes()).toContain("vc-date-range-input__segment--filled");
      expect(endSeg.classes()).toContain("vc-date-range-input__segment--filled");
    });

    it("marks neither segment --filled for an empty range", () => {
      const wrapper = mountInput();
      const segs = wrapper.findAllComponents({ name: "VcDateInput" });
      segs.forEach((seg) => expect(seg.classes()).not.toContain("vc-date-range-input__segment--filled"));
    });
  });

  describe("internal invalid feedback", () => {
    it("keeps the shell quiet while a segment is invalid but untouched", async () => {
      const wrapper = mountInput();
      const [startSeg] = wrapper.findAllComponents({ name: "VcDateInput" });
      startSeg.vm.$emit("update:valid", false);
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("update:valid")?.at(-1)?.[0]).toBe(false);
      expect(wrapper.classes()).not.toContain("vc-date-range-input--error");
      const details = wrapper.findComponent(VcInputDetails);
      expect(details.props("error")).toBe(false);
      expect(details.props("message")).toBeUndefined();
    });

    it("stays quiet on the first keystroke but reports update:valid=false", async () => {
      const wrapper = mountInput();
      const [startInput] = wrapper.findAll("input");
      await startInput.setValue("1");

      expect(wrapper.emitted("update:valid")?.at(-1)?.[0]).toBe(false);
      expect(wrapper.classes()).not.toContain("vc-date-range-input--error");
      expect(wrapper.findComponent(VcInputDetails).props("message")).toBeUndefined();
    });

    it("shows the format message once the malformed segment is blurred", async () => {
      const wrapper = mountInput();
      const [startInput] = wrapper.findAll("input");
      await startInput.setValue("99/99/9999");
      await startInput.trigger("blur");

      expect(wrapper.classes()).toContain("vc-date-range-input--error");
      const details = wrapper.findComponent(VcInputDetails);
      expect(details.props("error")).toBe(true);
      expect(details.props("message")).toBe("ui_kit.date_input.invalid_format");
    });

    it("shows the segment's own min message, not the format one, for a well-formed out-of-range date", async () => {
      const wrapper = mountInput({ min: "2026-10-05" });
      const [startInput] = wrapper.findAll("input");
      await startInput.setValue("10/01/2026");
      await startInput.trigger("blur");

      const details = wrapper.findComponent(VcInputDetails);
      expect(details.props("error")).toBe(true);
      expect(details.props("message")).toBe("ui_kit.date_input.min_date_error");
    });

    it("shows the range-order message when start > end", () => {
      const wrapper = mountInput({ modelValue: { start: "2026-10-20", end: "2026-10-01" } });
      expect(wrapper.classes()).toContain("vc-date-range-input--error");
      expect(wrapper.findComponent(VcInputDetails).props("message")).toBe("ui_kit.date_range_input.invalid_range");
    });

    // A parent that owns its own details row needs the message, not just the boolean validity.
    it("relays its validation message upward as update:errorText", async () => {
      const wrapper = mountInput({ modelValue: { start: "2026-10-20", end: "2026-10-01" } });
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("update:errorText")?.at(-1)).toEqual(["ui_kit.date_range_input.invalid_range"]);

      await wrapper.setProps({ modelValue: { start: "2026-10-01", end: "2026-10-20" } });
      expect(wrapper.emitted("update:errorText")?.at(-1)).toEqual([undefined]);
    });

    it("relays a segment's own message, not the order one", async () => {
      const wrapper = mountInput();
      const [startSeg] = wrapper.findAllComponents({ name: "VcDateInput" });
      startSeg.vm.$emit("update:errorText", "ui_kit.date_input.min_date_error");
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("update:errorText")?.at(-1)).toEqual(["ui_kit.date_input.min_date_error"]);
    });

    it("keeps the external message out of the relay", async () => {
      const wrapper = mountInput({ message: "Pick a delivery window" });
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("update:errorText")?.at(-1)).toEqual([undefined]);
      expect(wrapper.findComponent(VcInputDetails).props("message")).toBe("Pick a delivery window");
    });

    it("clears the internal error once the segment stops reporting a message", async () => {
      const wrapper = mountInput();
      const [startSeg] = wrapper.findAllComponents({ name: "VcDateInput" });
      startSeg.vm.$emit("update:valid", false);
      startSeg.vm.$emit("update:errorText", "ui_kit.date_input.invalid_format");
      await wrapper.vm.$nextTick();
      expect(wrapper.classes()).toContain("vc-date-range-input--error");
      startSeg.vm.$emit("update:valid", true);
      startSeg.vm.$emit("update:errorText", undefined);
      await wrapper.vm.$nextTick();
      expect(wrapper.classes()).not.toContain("vc-date-range-input--error");
    });

    it("keeps an empty range non-error", () => {
      const wrapper = mountInput();
      expect(wrapper.classes()).not.toContain("vc-date-range-input--error");
      expect(wrapper.findComponent(VcInputDetails).props("message")).toBeUndefined();
    });

    it("lets external error/message props take precedence over internal validation", async () => {
      const wrapper = mountInput({ error: true, message: "external" });
      const [startSeg] = wrapper.findAllComponents({ name: "VcDateInput" });
      startSeg.vm.$emit("update:valid", false);
      await wrapper.vm.$nextTick();
      expect(wrapper.classes()).toContain("vc-date-range-input--error");
      expect(wrapper.findComponent(VcInputDetails).props("message")).toBe("external");
    });
  });

  describe("shared details a11y wiring", () => {
    it("points both segments at the shared details row and marks them invalid", () => {
      const wrapper = mountInput({ modelValue: { start: "2026-10-20", end: "2026-10-01" } });
      const detailsId = wrapper.findComponent(VcInputDetails).attributes("id");
      expect(detailsId).toBeTruthy();

      const inputs = wrapper.findAll("input");
      expect(inputs.map((input) => input.attributes("aria-describedby"))).toEqual([detailsId, detailsId]);
      expect(inputs.map((input) => input.attributes("aria-invalid"))).toEqual(["true", "true"]);
    });

    it("describes both segments for a plain external message too", () => {
      const wrapper = mountInput({ message: "pick a range" });
      const detailsId = wrapper.findComponent(VcInputDetails).attributes("id");
      const inputs = wrapper.findAll("input");
      expect(inputs.map((input) => input.attributes("aria-describedby"))).toEqual([detailsId, detailsId]);
      expect(inputs.map((input) => input.attributes("aria-invalid"))).toEqual(["false", "false"]);
    });

    it("leaves aria-describedby off when there is nothing to describe", () => {
      const wrapper = mountInput({ modelValue: { start: "2026-10-01", end: "2026-10-20" } });
      const inputs = wrapper.findAll("input");
      expect(inputs.map((input) => input.attributes("aria-describedby"))).toEqual([undefined, undefined]);
      expect(inputs.map((input) => input.attributes("aria-invalid"))).toEqual(["false", "false"]);
    });

    // VcLabel stays real here: the asterisk is what the segments must NOT repeat, so a stub proves nothing.
    it("forwards required to both segments while the asterisk stays on the group label", () => {
      const wrapper = mount(VcDateRangeInput, {
        props: { modelValue: undefined, mask: true, label: "Date range", required: true },
        global: {
          components: { VcDateInput, VcInput, VcInputDetails, VcLabel },
          stubs: { VcIcon: true, VcTooltip: true, VcButton: true },
          directives: { "html-safe": {} },
        },
      });
      const inputs = wrapper.findAll("input");
      expect(wrapper.findAll(".vc-label__asterisk")).toHaveLength(1);
      expect(inputs.map((input) => input.attributes("aria-required"))).toEqual(["true", "true"]);
    });

    it("leaves aria-required off both segments when the range is optional", () => {
      const inputs = mountInput().findAll("input");
      expect(inputs.map((input) => input.attributes("aria-required"))).toEqual([undefined, undefined]);
    });
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
