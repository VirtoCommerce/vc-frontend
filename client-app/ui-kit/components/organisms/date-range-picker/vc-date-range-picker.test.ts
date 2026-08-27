import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import { VcInputDetails, VcLabel } from "@/ui-kit/components/atoms";
import VcDatePicker from "../date-picker/vc-date-picker.vue";
import VcDateRangePicker from "./vc-date-range-picker.vue";
import type { DOMWrapper, VueWrapper } from "@vue/test-utils";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";
import VcCalendar from "@/ui-kit/components/molecules/calendar/vc-calendar.vue";
import VcRangeCalendar from "@/ui-kit/components/molecules/calendar/vc-range-calendar.vue";
import VcDateInput from "@/ui-kit/components/molecules/date-input/vc-date-input.vue";
import VcDateRangeInput from "@/ui-kit/components/molecules/date-range-input/vc-date-range-input.vue";
import VcInput from "@/ui-kit/components/molecules/input/vc-input.vue";
import VcPopover from "@/ui-kit/components/molecules/popover/vc-popover.vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (k: string) => k, locale: { value: "en" } }) }));

// Globally registered in the app; mount() needs the real open/close chain, so only leaf atoms are stubbed.
const stubs = { VcLabel: true, VcIcon: true, VcTooltip: true };

function mountPicker(props = {}, options: { attachTo?: Element } = {}) {
  return mount(VcDateRangePicker, {
    props: { modelValue: undefined, ...props },
    global: {
      components: {
        VcDateInput,
        VcInput,
        VcInputDetails,
        VcButton,
        VcPopover,
        VcRangeCalendar,
        VcDateRangeInput,
        VcDatePicker,
      },
      stubs,
      directives: { "html-safe": {} },
    },
    ...options,
  });
}

// "split" nests two whole VcDatePickers, and VcLabel stays real so startLabel/endLabel render.
function mountSplit(props = {}, options: { attachTo?: Element } = {}) {
  return mount(VcDateRangePicker, {
    props: {
      modelValue: undefined,
      layout: "split",
      startLabel: "Start date",
      endLabel: "End date",
      ...props,
    },
    global: {
      // Unrendered "combined" branch, but the compiled template resolves every component up front.
      components: {
        VcDateInput,
        VcInput,
        VcInputDetails,
        VcLabel,
        VcButton,
        VcPopover,
        VcCalendar,
        VcRangeCalendar,
        VcDateRangeInput,
        VcDatePicker,
      },
      stubs: { VcIcon: true, VcTooltip: true },
      directives: { "html-safe": {} },
      mocks: { $t: (key: string) => key },
    },
    ...options,
  });
}

// Escape reverts through reka's internals, which only a real v-model round trip exercises.
function mountBoundPicker(initial: VcDateRangeType | undefined) {
  const state = ref<VcDateRangeType | undefined>(initial);
  const emits: (VcDateRangeType | undefined)[] = [];

  const Parent = defineComponent({
    setup() {
      return () =>
        h(VcDateRangePicker, {
          modelValue: state.value,
          "onUpdate:modelValue": (value: VcDateRangeType | undefined) => {
            state.value = value;
            emits.push(value);
          },
        });
    },
  });

  const wrapper = mount(Parent, {
    global: {
      components: {
        VcDateInput,
        VcInput,
        VcInputDetails,
        VcButton,
        VcPopover,
        VcRangeCalendar,
        VcDateRangeInput,
        VcDatePicker,
      },
      stubs,
      directives: { "html-safe": {} },
    },
    attachTo: document.body,
  });

  return { wrapper, state, emits };
}

// reka only builds a range from a real pointer path — a bare click leaves highlightedRange null.
async function clickDay(iso: string): Promise<HTMLElement> {
  const cell = document.querySelector<HTMLElement>(
    `[data-reka-calendar-cell-trigger][data-value="${iso}"]:not([data-outside-view])`,
  );
  if (!cell) {
    throw new Error(`no in-view cell for ${iso}`);
  }
  cell.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
  await flushPromises();
  cell.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  await flushPromises();
  return cell;
}

describe("VcDateRangePicker", () => {
  it("renders a VcDateRangeInput and forwards the range value", () => {
    const wrapper = mountPicker({ modelValue: { start: "2026-10-08", end: "2026-10-14" } });
    const input = wrapper.findComponent({ name: "VcDateRangeInput" });
    expect(input.exists()).toBe(true);
    expect(input.props("modelValue")).toEqual({ start: "2026-10-08", end: "2026-10-14" });
  });

  it("re-emits update:modelValue from the input", async () => {
    const wrapper = mountPicker();
    wrapper.findComponent({ name: "VcDateRangeInput" }).vm.$emit("update:modelValue", { start: "2026-10-08" });
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual({ start: "2026-10-08" });
  });

  it("re-emits update:valid from the input", async () => {
    const wrapper = mountPicker();
    wrapper.findComponent({ name: "VcDateRangeInput" }).vm.$emit("update:valid", false);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:valid")?.at(-1)?.[0]).toBe(false);
  });

  // Whichever layout owns the details row, the message has to reach a parent that renders its own.
  it("re-emits update:errorText from the input in the combined layout", async () => {
    const wrapper = mountPicker();
    wrapper
      .findComponent({ name: "VcDateRangeInput" })
      .vm.$emit("update:errorText", "ui_kit.date_input.max_date_error");
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:errorText")?.at(-1)).toEqual(["ui_kit.date_input.max_date_error"]);
  });

  it("emits its own update:errorText in the split layout", async () => {
    const wrapper = mountSplit({ modelValue: { start: "2026-10-20", end: "2026-10-01" } });
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:errorText")?.at(-1)).toEqual(["ui_kit.date_range_input.invalid_range"]);

    await wrapper.setProps({ modelValue: { start: "2026-10-01", end: "2026-10-20" } });
    expect(wrapper.emitted("update:errorText")?.at(-1)).toEqual([undefined]);
  });

  it("keeps the popover open when the calendar emits an anchor-only partial range", async () => {
    const wrapper = mountPicker({}, { attachTo: document.body });

    await wrapper.find('button[aria-haspopup="dialog"]').trigger("click");
    const bodyBefore = wrapper.find(".vc-popover__body");
    expect(bodyBefore.attributes("style")).toContain("display: block");

    wrapper.findComponent({ name: "VcRangeCalendar" }).vm.$emit("update:modelValue", { start: "2026-10-08" });
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual({ start: "2026-10-08" });
    const bodyAfter = wrapper.find(".vc-popover__body");
    expect(bodyAfter.attributes("style")).toContain("display: block");

    wrapper.unmount();
  });

  it("closes the popover and returns focus to the start segment when the calendar emits a complete range", async () => {
    const wrapper = mountPicker({}, { attachTo: document.body });

    await wrapper.find('button[aria-haspopup="dialog"]').trigger("click");
    const bodyBefore = wrapper.find(".vc-popover__body");
    expect(bodyBefore.attributes("style")).toContain("display: block");

    wrapper
      .findComponent({ name: "VcRangeCalendar" })
      .vm.$emit("update:modelValue", { start: "2026-10-08", end: "2026-10-14" });
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual({ start: "2026-10-08", end: "2026-10-14" });
    const bodyAfter = wrapper.find(".vc-popover__body");
    expect(bodyAfter.attributes("style")).toContain("display: none");

    const [startInput] = wrapper.findAllComponents({ name: "VcDateInput" });
    expect(document.activeElement).toBe(startInput.find("input").element);

    wrapper.unmount();
  });

  it("closes the popover and returns focus to the start segment when the calendar footer clears the range", async () => {
    const wrapper = mountPicker(
      { modelValue: { start: "2026-10-08", end: "2026-10-14" }, showFooter: true },
      { attachTo: document.body },
    );

    await wrapper.find('button[aria-haspopup="dialog"]').trigger("click");
    expect(wrapper.find(".vc-popover__body").attributes("style")).toContain("display: block");

    await wrapper.find(".vc-range-calendar__footer-btn").trigger("click");

    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toBeUndefined();
    expect(wrapper.find(".vc-popover__body").attributes("style")).toContain("display: none");

    const [startInput] = wrapper.findAllComponents({ name: "VcDateInput" });
    expect(document.activeElement).toBe(startInput.find("input").element);

    wrapper.unmount();
  });

  it("closes the popover when the footer clears an already-empty range", async () => {
    const wrapper = mountPicker({ showFooter: true }, { attachTo: document.body });

    await wrapper.find('button[aria-haspopup="dialog"]').trigger("click");
    await wrapper.find(".vc-range-calendar__footer-btn").trigger("click");

    expect(wrapper.find(".vc-popover__body").attributes("style")).toContain("display: none");
    expect(wrapper.emitted("clear")).toHaveLength(1);

    wrapper.unmount();
  });

  it("drops uncommitted garbage text from the segments when the calendar footer clears", async () => {
    const wrapper = mountPicker({ showFooter: true, mask: true }, { attachTo: document.body });

    const [startInput] = wrapper.findAll("input");
    await startInput.setValue("99/99/9999");
    expect(startInput.element.value).toBe("99/99/9999");

    await wrapper.find('button[aria-haspopup="dialog"]').trigger("click");
    await wrapper.find(".vc-range-calendar__footer-btn").trigger("click");
    await flushPromises();

    expect(wrapper.findAll("input").map((input) => input.element.value)).toEqual(["", ""]);

    wrapper.unmount();
  });

  it("re-emits clear when the calendar footer clears a filled range", async () => {
    const wrapper = mountPicker(
      { modelValue: { start: "2026-10-08", end: "2026-10-14" }, showFooter: true },
      { attachTo: document.body },
    );

    await wrapper.find('button[aria-haspopup="dialog"]').trigger("click");
    await wrapper.find(".vc-range-calendar__footer-btn").trigger("click");

    expect(wrapper.emitted("clear")).toHaveLength(1);

    wrapper.unmount();
  });

  it("emits update:valid exactly once, as false, for an out-of-order initial model", () => {
    const wrapper = mountPicker({ modelValue: { start: "2026-10-20", end: "2026-10-01" } });
    expect(wrapper.emitted("update:valid")).toEqual([[false]]);
  });

  it("returns focus to the start segment when the trigger click closes the popover with focus in the calendar", async () => {
    const wrapper = mountPicker({}, { attachTo: document.body });
    const trigger = wrapper.find('button[aria-haspopup="dialog"]');

    await trigger.trigger("click");
    await flushPromises();
    const activeCell = document.activeElement as HTMLElement | null;
    expect(activeCell?.dataset.rekaCalendarCellTrigger).toBeDefined();

    await trigger.trigger("click");

    const [startInput] = wrapper.findAllComponents({ name: "VcDateInput" });
    expect(document.activeElement).toBe(startInput.find("input").element);

    wrapper.unmount();
  });

  it("lets Escape propagate to outer layers while the popover is closed and swallows it once open", async () => {
    const onEscape = vi.fn();
    document.body.addEventListener("keydown", onEscape);
    const wrapper = mountPicker({}, { attachTo: document.body });

    const input = wrapper.find("input");
    await input.trigger("keydown", { key: "Escape" });
    expect(onEscape).toHaveBeenCalledTimes(1);

    await wrapper.find('button[aria-haspopup="dialog"]').trigger("click");
    await input.trigger("keydown", { key: "Escape" });
    expect(onEscape).toHaveBeenCalledTimes(1);
    expect(wrapper.find(".vc-popover__body").attributes("style")).toContain("display: none");

    document.body.removeEventListener("keydown", onEscape);
    wrapper.unmount();
  });

  describe("opening the calendar does not blur the field", () => {
    it("combined: no blur on opening; blur still fires when focus truly leaves", async () => {
      const outside = document.createElement("button");
      document.body.appendChild(outside);
      const wrapper = mountPicker({}, { attachTo: document.body });

      const [startInput] = wrapper.findAll("input");
      startInput.element.focus();
      expect(wrapper.emitted("focus")).toHaveLength(1);

      const trigger = wrapper.find('button[aria-haspopup="dialog"]');
      (trigger.element as HTMLButtonElement).focus();
      await trigger.trigger("click");
      await flushPromises();

      const activeCell = document.activeElement as HTMLElement | null;
      expect(activeCell?.dataset.rekaCalendarCellTrigger).toBeDefined();
      expect(wrapper.emitted("blur")).toBeUndefined();

      // Trigger-click close returns focus to the start input; leaving from there must still blur.
      await trigger.trigger("click");
      expect(document.activeElement).toBe(startInput.element);
      outside.focus();
      expect(wrapper.emitted("blur")).toHaveLength(1);

      wrapper.unmount();
      outside.remove();
    });

    // The suppressed blur still has to be paid back: leaving through the calendar is a real departure,
    // and the shell sees no focusout of its own for it.
    it("combined: blurs exactly once when focus leaves the calendar for the outside", async () => {
      const outside = document.createElement("button");
      document.body.appendChild(outside);
      const wrapper = mountPicker({}, { attachTo: document.body });

      const [startInput] = wrapper.findAll("input");
      startInput.element.focus();

      const trigger = wrapper.find('button[aria-haspopup="dialog"]');
      (trigger.element as HTMLButtonElement).focus();
      await trigger.trigger("click");
      await flushPromises();
      expect(wrapper.emitted("blur")).toBeUndefined();

      outside.focus();
      expect(wrapper.emitted("blur")).toHaveLength(1);

      wrapper.unmount();
      outside.remove();
    });

    it("combined: does not blur when focus returns from the calendar to the field", async () => {
      const wrapper = mountPicker({}, { attachTo: document.body });

      const [startInput] = wrapper.findAll("input");
      startInput.element.focus();
      const focusCount = wrapper.emitted("focus")?.length;

      const trigger = wrapper.find('button[aria-haspopup="dialog"]');
      (trigger.element as HTMLButtonElement).focus();
      await trigger.trigger("click");
      await flushPromises();

      startInput.element.focus();
      expect(wrapper.emitted("blur")).toBeUndefined();
      expect(wrapper.emitted("focus")?.length).toBe(focusCount);

      wrapper.unmount();
    });

    it.each([
      ["split with teleport", true],
      ["split without teleport", false],
    ])("%s: no blur on opening; blur still fires when focus truly leaves", async (_name, enableTeleport) => {
      // VcPopover teleports into the app's popover host, which the test DOM must provide.
      const popoverHost = document.createElement("div");
      popoverHost.id = "popover-host";
      document.body.appendChild(popoverHost);
      const outside = document.createElement("button");
      document.body.appendChild(outside);
      const wrapper = mountSplit({ enableTeleport }, { attachTo: document.body });

      const [startInput] = wrapper.findAll("input");
      startInput.element.focus();
      expect(wrapper.emitted("focus")).toHaveLength(1);

      const [startTrigger] = wrapper.findAll('button[aria-label="ui_kit.accessibility.open_calendar"]');
      (startTrigger.element as HTMLButtonElement).focus();
      await startTrigger.trigger("click");
      await flushPromises();

      const activeCell = document.activeElement as HTMLElement | null;
      expect(activeCell?.dataset.rekaCalendarCellTrigger).toBeDefined();
      expect(wrapper.emitted("blur")).toBeUndefined();

      // Escape closes the popover and restores focus to the field; leaving from there must still blur.
      await startInput.trigger("keydown", { key: "Escape" });
      expect(document.activeElement).toBe(startInput.element);
      outside.focus();
      expect(wrapper.emitted("blur")).toHaveLength(1);

      wrapper.unmount();
      outside.remove();
      popoverHost.remove();
    });

    // Leaving the open calendar directly, with no Escape first: without teleport the popover sits in the
    // fieldset, so the departure both bubbles here and reaches the document watch — one blur, not two.
    it.each([
      ["split with teleport", true],
      ["split without teleport", false],
    ])("%s: leaving the open calendar for the outside blurs exactly once", async (_name, enableTeleport) => {
      const popoverHost = document.createElement("div");
      popoverHost.id = "popover-host";
      document.body.appendChild(popoverHost);
      const outside = document.createElement("button");
      document.body.appendChild(outside);
      const wrapper = mountSplit({ enableTeleport }, { attachTo: document.body });

      const [startInput] = wrapper.findAll("input");
      startInput.element.focus();

      const [startTrigger] = wrapper.findAll('button[aria-label="ui_kit.accessibility.open_calendar"]');
      (startTrigger.element as HTMLButtonElement).focus();
      await startTrigger.trigger("click");
      await flushPromises();

      const activeCell = document.activeElement as HTMLElement | null;
      expect(activeCell?.dataset.rekaCalendarCellTrigger).toBeDefined();
      expect(wrapper.element.contains(activeCell)).toBe(!enableTeleport);

      outside.focus();
      expect(wrapper.emitted("blur")).toHaveLength(1);

      wrapper.unmount();
      outside.remove();
      popoverHost.remove();
    });
  });

  // Re-anchoring is a legitimate partial; Escape must undo it whole, not leave a half-reverted range.
  it("restores the committed range when Escape follows a re-anchoring calendar click", async () => {
    const { wrapper, state, emits } = mountBoundPicker({ start: "2026-10-08", end: "2026-10-14" });

    await wrapper.find('button[aria-haspopup="dialog"]').trigger("click");
    await flushPromises();

    const cell = await clickDay("2026-10-20");
    expect(state.value).toEqual({ start: "2026-10-20", end: undefined });

    cell.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await flushPromises();

    expect(state.value).toEqual({ start: "2026-10-08", end: "2026-10-14" });
    expect(emits.at(-1)).toEqual({ start: "2026-10-08", end: "2026-10-14" });
    expect(emits.filter((value) => !value?.end)).toHaveLength(1);

    const [startInput, endInput] = wrapper.findAll("input");
    expect(startInput.element.value).not.toBe("");
    expect(endInput.element.value).not.toBe("");

    wrapper.unmount();
  });

  it("defaults to the combined layout", () => {
    const wrapper = mountPicker();
    expect(wrapper.props("layout")).toBe("combined");
    expect(wrapper.classes()).toContain("vc-date-range-picker--layout--combined");
    expect(wrapper.findComponent({ name: "VcDateRangeInput" }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: "VcDatePicker" }).exists()).toBe(false);
  });
});

// Production renders this row inside VcPopover's #content, so a `.vc-popover__body` WRAPS the shell.
// Treating any popover in the relatedTarget's ancestry as "the field's own calendar" swallowed every blur.
describe("VcDateRangePicker — hosted inside a popover body", () => {
  type MountedType = ReturnType<typeof mountSplit>;

  function inPopoverBody<T>(mounter: (options: { attachTo: Element }) => T) {
    const body = document.createElement("div");
    body.className = "vc-popover__body";
    document.body.appendChild(body);
    const sibling = document.createElement("button");
    body.appendChild(sibling);
    return { wrapper: mounter({ attachTo: body }), body, sibling };
  }

  function teleportHost(): HTMLElement {
    const host = document.createElement("div");
    host.id = "popover-host";
    document.body.appendChild(host);
    return host;
  }

  function expectBlurWhenLeavingToSibling(wrapper: MountedType, sibling: HTMLElement): void {
    const [startInput] = wrapper.findAll("input");
    startInput.element.focus();
    expect(wrapper.emitted("focus")).toHaveLength(1);

    sibling.focus();
    expect(wrapper.emitted("blur")).toHaveLength(1);
  }

  async function expectNoBlurWhenOpeningOwnCalendar(wrapper: MountedType): Promise<void> {
    const [trigger] = wrapper.findAll('button[aria-label="ui_kit.accessibility.open_calendar"]');
    (trigger.element as HTMLButtonElement).focus();
    await trigger.trigger("click");
    await flushPromises();

    expect((document.activeElement as HTMLElement | null)?.dataset.rekaCalendarCellTrigger).toBeDefined();
    expect(wrapper.emitted("blur")).toBeUndefined();
  }

  it("combined: emits blur when focus leaves for a sibling inside the enclosing popover", () => {
    const { wrapper, body, sibling } = inPopoverBody((options) => mountPicker({}, options));
    expectBlurWhenLeavingToSibling(wrapper, sibling);
    wrapper.unmount();
    body.remove();
  });

  it("split with teleport: emits blur when focus leaves for a sibling inside the enclosing popover", () => {
    const host = teleportHost();
    const { wrapper, body, sibling } = inPopoverBody((options) => mountSplit({ enableTeleport: true }, options));
    expectBlurWhenLeavingToSibling(wrapper, sibling);
    wrapper.unmount();
    body.remove();
    host.remove();
  });

  it("split without teleport: emits blur when focus leaves for a sibling inside the enclosing popover", () => {
    const { wrapper, body, sibling } = inPopoverBody((options) => mountSplit({ enableTeleport: false }, options));
    expectBlurWhenLeavingToSibling(wrapper, sibling);
    wrapper.unmount();
    body.remove();
  });

  it("combined: still swallows the focus move into its own calendar", async () => {
    const { wrapper, body } = inPopoverBody((options) => mountPicker({}, options));
    await expectNoBlurWhenOpeningOwnCalendar(wrapper);
    wrapper.unmount();
    body.remove();
  });

  it("split with teleport: still swallows the focus move into the field's own calendar", async () => {
    const host = teleportHost();
    const { wrapper, body } = inPopoverBody((options) => mountSplit({ enableTeleport: true }, options));
    await expectNoBlurWhenOpeningOwnCalendar(wrapper);
    wrapper.unmount();
    body.remove();
    host.remove();
  });

  it("split without teleport: still swallows the focus move into the field's own calendar", async () => {
    const { wrapper, body } = inPopoverBody((options) => mountSplit({ enableTeleport: false }, options));
    await expectNoBlurWhenOpeningOwnCalendar(wrapper);
    wrapper.unmount();
    body.remove();
  });
});

// Ownership is read from the shell's own aria-controls, so any OTHER popover on the page — a select
// listbox teleported beside the field — still counts as focus leaving, even while the calendar is open.
describe("VcDateRangePicker — focus moving into an unrelated popover", () => {
  function unrelatedPopover(): HTMLElement {
    const body = document.createElement("div");
    body.className = "vc-popover__body";
    body.id = "vc-popover-unrelated";
    const option = document.createElement("button");
    body.appendChild(option);
    document.body.appendChild(body);
    return option;
  }

  async function expectBlur(wrapper: ReturnType<typeof mountSplit>, option: HTMLElement): Promise<void> {
    const [trigger] = wrapper.findAll('button[aria-label="ui_kit.accessibility.open_calendar"]');
    await trigger.trigger("click");
    await flushPromises();

    const [startInput] = wrapper.findAll("input");
    startInput.element.focus();
    option.focus();

    expect(wrapper.emitted("blur")).toHaveLength(1);
  }

  it("combined: emits blur", async () => {
    const option = unrelatedPopover();
    const wrapper = mountPicker({}, { attachTo: document.body });
    await expectBlur(wrapper, option);
    wrapper.unmount();
    option.parentElement?.remove();
  });

  it("split: emits blur", async () => {
    const option = unrelatedPopover();
    const wrapper = mountSplit({}, { attachTo: document.body });
    await expectBlur(wrapper, option);
    wrapper.unmount();
    option.parentElement?.remove();
  });
});

describe("VcDateRangePicker — split layout", () => {
  it("renders two VcDatePicker fields instead of the combined input", () => {
    const wrapper = mountSplit();
    expect(wrapper.findAllComponents({ name: "VcDatePicker" })).toHaveLength(2);
    expect(wrapper.findComponent({ name: "VcDateRangeInput" }).exists()).toBe(false);
  });

  it("turns startLabel/endLabel into visible labels bound to their own input", () => {
    const wrapper = mountSplit();
    const labels = wrapper.findAll("label");
    expect(labels.map((label) => label.text())).toEqual(["Start date", "End date"]);

    const inputs = wrapper.findAll("input");
    expect(labels[0].attributes("for")).toBe(inputs[0].attributes("id"));
    expect(labels[1].attributes("for")).toBe(inputs[1].attributes("id"));
  });

  it("renders one calendar trigger per field", () => {
    const wrapper = mountSplit();
    const triggers = wrapper.findAll('button[aria-label="ui_kit.accessibility.open_calendar"]');
    expect(triggers).toHaveLength(2);
  });

  it("renders exactly one details row for the whole row of fields", () => {
    const wrapper = mountSplit({ error: true, message: "external" });
    const details = wrapper.findAllComponents(VcInputDetails);
    expect(details).toHaveLength(1);
    expect(details[0].props("message")).toBe("external");
  });

  it("exposes the row as a labelled group", () => {
    const wrapper = mountSplit({ label: "Date range" });
    const group = wrapper.find("fieldset");
    expect(group.exists()).toBe(true);
    expect(group.attributes("aria-label")).toBe("Date range");
  });

  it("falls back to the generic group label when no label is given", () => {
    const wrapper = mountSplit();
    expect(wrapper.find("fieldset").attributes("aria-label")).toBe("ui_kit.date_range_input.aria_label");
  });

  it("falls back to default accessible names for the fields when startLabel/endLabel are omitted", () => {
    const inputs = mountSplit({ startLabel: undefined, endLabel: undefined }).findAll("input");
    expect(inputs.map((input) => input.attributes("aria-label"))).toEqual([
      "ui_kit.date_range_input.start_date",
      "ui_kit.date_range_input.end_date",
    ]);
  });

  it("keeps the visible labels as the fields' accessible names when provided", () => {
    const inputs = mountSplit().findAll("input");
    expect(inputs.map((input) => input.attributes("aria-label"))).toEqual(["Start date", "End date"]);
  });

  it("gates Escape per field popover and restores focus to that field's input", async () => {
    const onEscape = vi.fn();
    document.body.addEventListener("keydown", onEscape);
    const wrapper = mountSplit({}, { attachTo: document.body });
    const [startInput] = wrapper.findAll("input");

    await startInput.trigger("keydown", { key: "Escape" });
    expect(onEscape).toHaveBeenCalledTimes(1);

    const [startTrigger] = wrapper.findAll('button[aria-label="ui_kit.accessibility.open_calendar"]');
    await startTrigger.trigger("click");
    await flushPromises();
    await startInput.trigger("keydown", { key: "Escape" });

    expect(onEscape).toHaveBeenCalledTimes(1);
    expect(wrapper.find(".vc-popover__body").attributes("style")).toContain("display: none");
    expect(document.activeElement).toBe(startInput.element);

    document.body.removeEventListener("keydown", onEscape);
    wrapper.unmount();
  });

  describe("advisory cross-bounds", () => {
    function calendarBounds(wrapper: ReturnType<typeof mountSplit>) {
      const [start, end] = wrapper.findAllComponents(VcCalendar);
      return {
        startSoftMax: start.props("softMax"),
        startMin: start.props("min"),
        startMax: start.props("max"),
        endSoftMin: end.props("softMin"),
        endMin: end.props("min"),
        endMax: end.props("max"),
      };
    }

    function dayCells(calendar: VueWrapper): DOMWrapper<Element>[] {
      return calendar.findAll("[data-reka-calendar-cell-trigger]:not([data-outside-view])");
    }

    function enabledDayCount(calendar: VueWrapper): number {
      return dayCells(calendar).filter(
        (cell) => cell.attributes("data-disabled") === undefined && cell.attributes("aria-disabled") !== "true",
      ).length;
    }

    function markedDays(calendar: VueWrapper): string[] {
      return dayCells(calendar)
        .filter((cell) => cell.attributes("data-soft-out-of-bounds") !== undefined)
        .map((cell) => cell.attributes("data-value") ?? "");
    }

    function disabledDays(calendar: VueWrapper): string[] {
      return dayCells(calendar)
        .filter((cell) => cell.attributes("data-disabled") !== undefined || cell.attributes("aria-disabled") === "true")
        .map((cell) => cell.attributes("data-value") ?? "");
    }

    function navDisabled(calendar: VueWrapper): boolean[] {
      return [".vc-calendar__nav--month-next", ".vc-calendar__nav--year-next"].map(
        (selector) => calendar.find(selector).attributes("disabled") !== undefined,
      );
    }

    it("hands each calendar the opposite endpoint as an advisory bound", () => {
      const bounds = calendarBounds(mountSplit({ modelValue: { start: "2026-10-08", end: "2026-10-14" } }));
      expect(bounds.startSoftMax).toBe("2026-10-14");
      expect(bounds.endSoftMin).toBe("2026-10-08");
    });

    it("leaves the caller's own boundaries as the only hard ones", () => {
      const bounds = calendarBounds(
        mountSplit({ modelValue: { start: "2026-10-08", end: "2026-10-14" }, min: "2026-10-05", max: "2026-10-25" }),
      );
      expect(bounds.startMin).toBe("2026-10-05");
      expect(bounds.startMax).toBe("2026-10-25");
      expect(bounds.endMin).toBe("2026-10-05");
      expect(bounds.endMax).toBe("2026-10-25");
    });

    it("drops the advisory bound while the opposite endpoint is empty", () => {
      const bounds = calendarBounds(mountSplit({ modelValue: { start: "2026-10-08", end: undefined } }));
      expect(bounds.startSoftMax).toBeUndefined();
      expect(bounds.endSoftMin).toBe("2026-10-08");
    });

    it("recomputes the advisory bound when the range changes", async () => {
      const wrapper = mountSplit({ modelValue: { start: "2026-10-08", end: "2026-10-14" } });
      await wrapper.setProps({ modelValue: { start: "2026-10-08", end: "2026-10-20" } });
      expect(calendarBounds(wrapper).startSoftMax).toBe("2026-10-20");
    });

    // An advisory bound cannot invert against min/max or empty a month, so it needs no reconciliation:
    // the raw endpoint is handed over in every state the old hard clamp had to back out of.
    it("keeps the raw endpoint when the range is already out of order", () => {
      const bounds = calendarBounds(mountSplit({ modelValue: { start: "2026-12-01", end: "2026-10-14" } }));
      expect(bounds.startSoftMax).toBe("2026-10-14");
      expect(bounds.endSoftMin).toBe("2026-12-01");
    });

    it("keeps the raw endpoint when it sits outside the caller's own bounds", () => {
      const bounds = calendarBounds(
        mountSplit({ min: "2026-08-25", max: "2026-12-31", modelValue: { start: "2026-03-01", end: "2026-03-20" } }),
      );
      expect(bounds.startSoftMax).toBe("2026-03-20");
      expect(bounds.endSoftMin).toBe("2026-03-01");
    });

    it("marks the days past the advisory bound without disabling any of them", () => {
      const wrapper = mountSplit({ modelValue: { start: "2026-10-08", end: "2026-10-14" } });
      const [startCalendar, endCalendar] = wrapper.findAllComponents(VcCalendar);

      expect(markedDays(startCalendar)).toContain("2026-10-20");
      expect(markedDays(startCalendar)).not.toContain("2026-10-10");
      expect(markedDays(endCalendar)).toContain("2026-10-01");
      expect(markedDays(endCalendar)).not.toContain("2026-10-20");

      expect(disabledDays(startCalendar)).toEqual([]);
      expect(disabledDays(endCalendar)).toEqual([]);
      expect(enabledDayCount(startCalendar)).toBe(31);
      expect(enabledDayCount(endCalendar)).toBe(31);
      expect(dayCells(startCalendar)).toHaveLength(31);
    });

    it("explains the marker through a title, since the day keeps its enabled semantics", () => {
      const [startCalendar] = mountSplit({
        modelValue: { start: "2026-10-08", end: "2026-10-14" },
      }).findAllComponents(VcCalendar);
      const marked = dayCells(startCalendar).find((cell) => cell.attributes("data-value") === "2026-10-20");
      expect(marked?.attributes("title")).toBe("ui_kit.calendar.outside_suggested_range");
    });

    it("never gates month or year navigation", () => {
      const wrapper = mountSplit({ modelValue: { start: "2026-10-08", end: "2026-10-14" } });
      const [startCalendar, endCalendar] = wrapper.findAllComponents(VcCalendar);
      expect(navDisabled(startCalendar)).toEqual([false, false]);
      expect(navDisabled(endCalendar)).toEqual([false, false]);
    });

    it("does not pull the open month toward an advisory bound arriving after mount", async () => {
      const wrapper = mountSplit();
      const [startCalendar] = wrapper.findAllComponents(VcCalendar);
      const openedOn = startCalendar.find(".vc-calendar__heading").text();

      await wrapper.setProps({ modelValue: { start: undefined, end: "2020-06-15" } });
      await flushPromises();

      expect(startCalendar.find(".vc-calendar__heading").text()).toBe(openedOn);
      // The whole month it stayed on is still selectable; only June 2020 lies past the advisory bound.
      expect(enabledDayCount(startCalendar)).toBe(dayCells(startCalendar).length);
    });

    it("lets a marked day be picked and reports the inverted range it produces", async () => {
      const wrapper = mountSplit({ modelValue: { start: "2026-10-08", end: "2026-10-14" } });
      const [startCalendar] = wrapper.findAllComponents(VcCalendar);
      const marked = dayCells(startCalendar).find((cell) => cell.attributes("data-value") === "2026-10-20");

      await marked?.trigger("click");

      expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([{ start: "2026-10-20", end: "2026-10-14" }]);

      // Validity is derived from the prop, so the inverted range is only reported once a parent accepts it.
      await wrapper.setProps({ modelValue: { start: "2026-10-20", end: "2026-10-14" } });
      expect(wrapper.emitted("update:valid")?.at(-1)?.[0]).toBe(false);
      expect(wrapper.findComponent(VcInputDetails).props("message")).toBe("ui_kit.date_range_input.invalid_range");
    });
  });

  describe("range order validity", () => {
    it("seeds update:valid=true for an empty range on mount", () => {
      const wrapper = mountSplit();
      expect(wrapper.emitted("update:valid")?.at(-1)?.[0]).toBe(true);
    });

    it("flips update:valid to false when the committed end precedes the start", async () => {
      const wrapper = mountSplit({ modelValue: { start: "2026-10-20", end: undefined } });
      expect(wrapper.emitted("update:valid")?.at(-1)?.[0]).toBe(true);

      await wrapper.setProps({ modelValue: { start: "2026-10-20", end: "2026-10-01" } });
      expect(wrapper.emitted("update:valid")?.at(-1)?.[0]).toBe(false);
    });

    it("surfaces invalid_range exactly once for an out-of-order range", () => {
      const wrapper = mountSplit({ modelValue: { start: "2026-10-20", end: "2026-10-01" } });
      const details = wrapper.findAllComponents(VcInputDetails);
      expect(details).toHaveLength(1);
      expect(details[0].props("message")).toBe("ui_kit.date_range_input.invalid_range");
    });

    it("reports a field's own min message through the shared details row, not the format one", async () => {
      const wrapper = mountSplit({ min: "2026-10-05" });
      const [startInput] = wrapper.findAll("input");
      await startInput.setValue("10/01/2026");
      await startInput.trigger("blur");

      const details = wrapper.findComponent(VcInputDetails);
      expect(details.props("error")).toBe(true);
      expect(details.props("message")).toBe("ui_kit.date_input.min_date_error");
    });

    it("reports a segment's format error through the shared details row", async () => {
      const wrapper = mountSplit();
      const [startField] = wrapper.findAllComponents({ name: "VcDatePicker" });
      startField.vm.$emit("update:valid", false);
      startField.vm.$emit("update:errorText", "ui_kit.date_input.invalid_format");
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted("update:valid")?.at(-1)?.[0]).toBe(false);
      expect(wrapper.findComponent(VcInputDetails).props("message")).toBe("ui_kit.date_input.invalid_format");
    });

    it("keeps the shared details row quiet while a segment is invalid but untouched", async () => {
      const wrapper = mountSplit();
      const [startField] = wrapper.findAllComponents({ name: "VcDatePicker" });
      startField.vm.$emit("update:valid", false);
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted("update:valid")?.at(-1)?.[0]).toBe(false);
      expect(wrapper.findComponent(VcInputDetails).props("message")).toBeUndefined();
      expect(wrapper.findComponent(VcInputDetails).props("error")).toBe(false);
    });
  });

  describe("model merging", () => {
    it("emits a merged range when the start field commits", async () => {
      const wrapper = mountSplit({ modelValue: { start: undefined, end: "2026-10-14" } });
      const [startField] = wrapper.findAllComponents({ name: "VcDatePicker" });
      startField.vm.$emit("update:modelValue", "2026-10-08");
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual({ start: "2026-10-08", end: "2026-10-14" });
    });

    it("emits a merged range when the end field commits", async () => {
      const wrapper = mountSplit({ modelValue: { start: "2026-10-08", end: undefined } });
      const [, endField] = wrapper.findAllComponents({ name: "VcDatePicker" });
      endField.vm.$emit("update:modelValue", "2026-10-14");
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual({ start: "2026-10-08", end: "2026-10-14" });
    });

    it("collapses to undefined once both fields are cleared", async () => {
      const wrapper = mountSplit({ modelValue: { start: "2026-10-08", end: "2026-10-14" }, clearable: true });
      const [startField, endField] = wrapper.findAllComponents({ name: "VcDatePicker" });

      startField.vm.$emit("update:modelValue", undefined);
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual({ start: undefined, end: "2026-10-14" });

      await wrapper.setProps({ modelValue: { start: undefined, end: "2026-10-14" } });
      endField.vm.$emit("update:modelValue", undefined);
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toBeUndefined();
    });

    // Clearing one field commits the other's typed text in the same task, before the prop can update.
    it("keeps a just-typed end date when the start field is cleared in the same task", async () => {
      const wrapper = mountSplit(
        { modelValue: { start: "2026-08-08", end: undefined }, clearable: true },
        { attachTo: document.body },
      );

      const [, endInput] = wrapper.findAll("input");
      endInput.element.focus();
      await endInput.setValue("08/20/2026");

      const [clearButton] = wrapper.findAll('button[aria-label="ui_kit.buttons.clear"]');
      await clearButton.trigger("click");
      await flushPromises();

      expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual({ start: undefined, end: "2026-08-20" });
      expect(endInput.element.value).toBe("08/20/2026");

      wrapper.unmount();
    });

    // Uncontrolled parent: the model prop never changes, so a snapshot kept past the task would
    // resurrect the start date the parent already rejected.
    it("drops the previous emit's snapshot when the parent does not apply it", async () => {
      const wrapper = mountSplit();

      const [startInput, endInput] = wrapper.findAll("input");
      await startInput.setValue("06/15/2026");
      await startInput.trigger("blur");
      expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual({ start: "2026-06-15", end: undefined });

      await endInput.setValue("07/20/2026");
      await endInput.trigger("blur");
      expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual({ start: undefined, end: "2026-07-20" });
    });

    it("re-emits clear from either field", async () => {
      const wrapper = mountSplit({ modelValue: { start: "2026-10-08", end: "2026-10-14" }, clearable: true });
      const [startField, endField] = wrapper.findAllComponents({ name: "VcDatePicker" });

      startField.vm.$emit("clear");
      endField.vm.$emit("clear");
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted("clear")).toHaveLength(2);
    });
  });

  it("marks both fields when the external error prop is set", () => {
    const wrapper = mountSplit({ error: true, message: "external" });
    const fields = wrapper.findAllComponents({ name: "VcDatePicker" });
    expect(fields.map((field) => field.props("error"))).toEqual([true, true]);
    expect(fields.every((field) => field.props("hideDetails"))).toBe(true);
  });

  describe("shared details a11y wiring", () => {
    it("points both inputs at the shared details row and marks them invalid", () => {
      const wrapper = mountSplit({ modelValue: { start: "2026-10-20", end: "2026-10-01" } });
      const detailsId = wrapper.findComponent(VcInputDetails).attributes("id");
      expect(detailsId).toBeTruthy();

      const inputs = wrapper.findAll("input");
      expect(inputs.map((input) => input.attributes("aria-describedby"))).toEqual([detailsId, detailsId]);
      expect(inputs.map((input) => input.attributes("aria-invalid"))).toEqual(["true", "true"]);
    });

    it("describes both inputs for a plain external message too", () => {
      const wrapper = mountSplit({ message: "pick a range" });
      const detailsId = wrapper.findComponent(VcInputDetails).attributes("id");
      const inputs = wrapper.findAll("input");
      expect(inputs.map((input) => input.attributes("aria-describedby"))).toEqual([detailsId, detailsId]);
      expect(inputs.map((input) => input.attributes("aria-invalid"))).toEqual(["false", "false"]);
    });

    it("leaves aria-describedby off when there is nothing to describe", () => {
      const wrapper = mountSplit({ modelValue: { start: "2026-10-01", end: "2026-10-20" } });
      const inputs = wrapper.findAll("input");
      expect(inputs.map((input) => input.attributes("aria-describedby"))).toEqual([undefined, undefined]);
      expect(inputs.map((input) => input.attributes("aria-invalid"))).toEqual(["false", "false"]);
    });

    it("keeps VcDatePicker's own combobox wiring on the inputs", () => {
      const wrapper = mountSplit({ message: "pick a range" });
      const [startInput] = wrapper.findAll("input");
      expect(startInput.attributes("role")).toBe("combobox");
      expect(startInput.attributes("aria-expanded")).toBe("false");
    });
  });

  describe("focus/blur shell boundary", () => {
    it("emits focus exactly once when focus enters the row from outside", () => {
      const outside = document.createElement("button");
      document.body.appendChild(outside);
      outside.focus();

      const wrapper = mountSplit({}, { attachTo: document.body });
      const [startInput] = wrapper.findAll("input");
      startInput.element.focus();

      expect(wrapper.emitted("focus")).toHaveLength(1);
      expect(wrapper.emitted("blur")).toBeUndefined();

      wrapper.unmount();
      outside.remove();
    });

    it("emits nothing when focus moves between the two fields", () => {
      const wrapper = mountSplit({}, { attachTo: document.body });
      const [startInput, endInput] = wrapper.findAll("input");

      startInput.element.focus();
      expect(wrapper.emitted("focus")).toHaveLength(1);

      endInput.element.focus();

      expect(wrapper.emitted("focus")).toHaveLength(1);
      expect(wrapper.emitted("blur")).toBeUndefined();

      wrapper.unmount();
    });

    it("emits nothing when focus moves from a field to its own calendar trigger", () => {
      const wrapper = mountSplit({}, { attachTo: document.body });
      const [startInput] = wrapper.findAll("input");
      const [startTrigger] = wrapper.findAll('button[aria-label="ui_kit.accessibility.open_calendar"]');

      startInput.element.focus();
      (startTrigger.element as HTMLButtonElement).focus();

      expect(wrapper.emitted("focus")).toHaveLength(1);
      expect(wrapper.emitted("blur")).toBeUndefined();

      wrapper.unmount();
    });

    it("emits blur exactly once when focus leaves the row", () => {
      const outside = document.createElement("button");
      document.body.appendChild(outside);

      const wrapper = mountSplit({}, { attachTo: document.body });
      const [startInput] = wrapper.findAll("input");

      startInput.element.focus();
      outside.focus();

      expect(wrapper.emitted("focus")).toHaveLength(1);
      expect(wrapper.emitted("blur")).toHaveLength(1);

      wrapper.unmount();
      outside.remove();
    });
  });

  describe("per-side and root wiring", () => {
    it("renders a single required asterisk, on the group label", () => {
      const wrapper = mountSplit({ label: "Date range", required: true });
      expect(wrapper.findAll(".vc-label__asterisk")).toHaveLength(1);
      expect(wrapper.findAllComponents({ name: "VcDatePicker" }).map((field) => field.props("required"))).toEqual([
        false,
        false,
      ]);
    });

    it("keeps the required semantics on both inputs even though only the group shows an asterisk", () => {
      const wrapper = mountSplit({ label: "Date range", required: true });
      const inputs = wrapper.findAll("input");
      expect(inputs.map((input) => input.attributes("aria-required"))).toEqual(["true", "true"]);
    });

    it("leaves aria-required off both inputs when the range is optional", () => {
      const inputs = mountSplit({ label: "Date range" }).findAll("input");
      expect(inputs.map((input) => input.attributes("aria-required"))).toEqual([undefined, undefined]);
    });

    it("opens the start calendar start-aligned so it does not overhang the separator", () => {
      const [startField, endField] = mountSplit().findAllComponents({ name: "VcDatePicker" });
      expect(startField.props("placement")).toBe("bottom-start");
      expect(endField.props("placement")).toBe("bottom-end");
    });

    it("keeps the caller's vertical side on both fields for a non-default placement", () => {
      const [startField, endField] = mountSplit({ placement: "top-end" }).findAllComponents({ name: "VcDatePicker" });
      expect(startField.props("placement")).toBe("top-start");
      expect(endField.props("placement")).toBe("top-end");
    });

    it("passes side placements through untouched — they never overhang the separator", () => {
      const [startField, endField] = mountSplit({ placement: "left-start" }).findAllComponents({
        name: "VcDatePicker",
      });
      expect(startField.props("placement")).toBe("left-start");
      expect(endField.props("placement")).toBe("left-start");
    });

    it("puts dataTestId on the row root as well as the two fields", () => {
      const wrapper = mountSplit({ dataTestId: "order-date" });
      expect(wrapper.find("fieldset").attributes("data-test-id")).toBe("order-date");
      expect(wrapper.findAllComponents({ name: "VcDatePicker" }).map((field) => field.props("dataTestId"))).toEqual([
        "order-date-start",
        "order-date-end",
      ]);
    });

    it("leaves the per-side names and test ids undefined when the base value is absent", () => {
      const fields = mountSplit().findAllComponents({ name: "VcDatePicker" });
      expect(fields.map((field) => field.props("name"))).toEqual([undefined, undefined]);
      expect(fields.map((field) => field.props("dataTestId"))).toEqual([undefined, undefined]);
    });
  });
});
