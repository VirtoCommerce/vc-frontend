import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick } from "vue";
import { VcInputDetails, VcLabel } from "@/ui-kit/components/atoms";
import VcDatePicker from "./vc-date-picker.vue";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";
import VcCalendar from "@/ui-kit/components/molecules/calendar/vc-calendar.vue";
import VcDateInput from "@/ui-kit/components/molecules/date-input/vc-date-input.vue";
import VcInput from "@/ui-kit/components/molecules/input/vc-input.vue";
import VcPopover from "@/ui-kit/components/molecules/popover/vc-popover.vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (k: string) => k, locale: { value: "en" } }) }));

// A failed assertion skips a trailing unmount(), and the dialog block below reads document.activeElement.
enableAutoUnmount(afterEach);

// Globally registered in the app; mount() needs the real open/close chain, so only leaf atoms are stubbed.
function mountPicker(props = {}, options: { attachTo?: Element } = {}) {
  return mount(VcDatePicker, {
    props: { modelValue: "2026-10-08", ...props },
    global: {
      components: { VcDateInput, VcInput, VcInputDetails, VcLabel, VcButton, VcPopover, VcCalendar },
      stubs: { VcIcon: true, VcTooltip: true },
      directives: { "html-safe": {} },
      mocks: { $t: (key: string) => key },
    },
    ...options,
  });
}

function selectedDay(wrapper: ReturnType<typeof mountPicker>, iso: string) {
  return wrapper.find(`[data-reka-calendar-cell-trigger][data-value="${iso}"]:not([data-outside-view])`);
}

describe("VcDatePicker — preventDeselect", () => {
  // A lone field carries no clear control of its own, so the re-click is the only pointer route out.
  it("clears the value on a re-click by default", async () => {
    const wrapper = mountPicker();

    await selectedDay(wrapper, "2026-10-08").trigger("click");
    await flushPromises();

    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([undefined]);
  });

  it("keeps the value when preventDeselect is true", async () => {
    const wrapper = mountPicker({ preventDeselect: true });

    await selectedDay(wrapper, "2026-10-08").trigger("click");
    await flushPromises();

    // reka still reports the press; what matters is that it reports the same date, not an empty one.
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["2026-10-08"]);
  });

  it("forwards the flag to the calendar rather than acting on it itself", () => {
    expect(mountPicker().findComponent(VcCalendar).props("preventDeselect")).toBe(false);
    expect(mountPicker({ preventDeselect: true }).findComponent(VcCalendar).props("preventDeselect")).toBe(true);
  });
});

describe("VcDatePicker — footer Clear", () => {
  // An uncontrolled parent never writes the emit back, so a resync would repaint the cleared date.
  it("empties the field even when the parent never applies the clear", async () => {
    const wrapper = mountPicker({ showFooter: true });

    await wrapper.find(".vc-calendar__footer-btn--ghost").trigger("click");
    await flushPromises();

    expect(wrapper.find("input").element.value).toBe("");
  });

  it("emits clear alongside the model change", async () => {
    const wrapper = mountPicker({ showFooter: true });

    await wrapper.find(".vc-calendar__footer-btn--ghost").trigger("click");
    await flushPromises();

    expect(wrapper.emitted("clear")).toHaveLength(1);
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([undefined]);
  });

  it("stays put when the field is readonly", async () => {
    const wrapper = mountPicker({ showFooter: true, readonly: true });

    await wrapper.find(".vc-calendar__footer-btn--ghost").trigger("click");
    await flushPromises();

    expect(wrapper.emitted("clear")).toBeUndefined();
    expect(wrapper.find("input").element.value).not.toBe("");
  });
});

// One footer click fires BOTH `update:modelValue(undefined)` and `clear`, so each handler could close
// the popover on its own. Clearing is not picking — neither may.
describe("VcDatePicker — the footer Clear leaves the calendar open", () => {
  async function openCalendar(wrapper: ReturnType<typeof mountPicker>) {
    // The toggle lives in VcDateInput's append slot; aria-haspopup sits on the combobox input, not here.
    await wrapper.find('button[aria-label="ui_kit.accessibility.open_calendar"]').trigger("click");
    await flushPromises();
    expect(wrapper.find(".vc-popover__body").attributes("style")).toContain("display: block");
  }

  it("keeps it open on the real footer click, which drives both handlers at once", async () => {
    const wrapper = mountPicker({ showFooter: true }, { attachTo: document.body });
    await openCalendar(wrapper);

    await wrapper.find(".vc-calendar__footer-btn--ghost").trigger("click");
    await flushPromises();

    expect(wrapper.emitted("clear")).toHaveLength(1);
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([undefined]);
    expect(wrapper.find(".vc-popover__body").attributes("style")).toContain("display: block");

    wrapper.unmount();
  });

  it("keeps it open when only the model-update path fires", async () => {
    const wrapper = mountPicker({ showFooter: true }, { attachTo: document.body });
    await openCalendar(wrapper);

    wrapper.findComponent({ name: "VcCalendar" }).vm.$emit("update:modelValue", undefined);
    await flushPromises();

    expect(wrapper.find(".vc-popover__body").attributes("style")).toContain("display: block");

    wrapper.unmount();
  });

  it("keeps it open when only the clear path fires", async () => {
    const wrapper = mountPicker({ showFooter: true }, { attachTo: document.body });
    await openCalendar(wrapper);

    wrapper.findComponent({ name: "VcCalendar" }).vm.$emit("clear");
    await flushPromises();

    expect(wrapper.find(".vc-popover__body").attributes("style")).toContain("display: block");

    wrapper.unmount();
  });

  // A deselect (`preventDeselect: false`) reaches the same `undefined` branch but emits no `clear`.
  // Decision A: an empty result never closes, whichever route produced it.
  it("keeps it open on a deselect, which empties the value without emitting clear", async () => {
    const wrapper = mountPicker({ showFooter: true, preventDeselect: false }, { attachTo: document.body });
    await openCalendar(wrapper);

    await selectedDay(wrapper, "2026-10-08").trigger("click");
    await flushPromises();

    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([undefined]);
    expect(wrapper.emitted("clear")).toBeUndefined();
    expect(wrapper.find(".vc-popover__body").attributes("style")).toContain("display: block");

    wrapper.unmount();
  });

  it("still closes on a date pick, so closeOnSelect keeps its meaning", async () => {
    const wrapper = mountPicker({ showFooter: true }, { attachTo: document.body });
    await openCalendar(wrapper);

    wrapper.findComponent({ name: "VcCalendar" }).vm.$emit("update:modelValue", "2026-10-14");
    await flushPromises();

    expect(wrapper.find(".vc-popover__body").attributes("style")).toContain("display: none");

    wrapper.unmount();
  });
});

// The clear control does exactly one thing: it empties the field. It neither opens a closed calendar
// nor closes an open one.
describe("VcDatePicker — the field clear cross touches only the value", () => {
  it("leaves a closed calendar closed", async () => {
    const wrapper = mountPicker({ clearable: true }, { attachTo: document.body });

    expect(wrapper.find(".vc-popover__body").attributes("style")).toContain("display: none");

    await wrapper.find(".vc-input__clear").trigger("click");
    await flushPromises();

    expect(wrapper.emitted("clear")).toHaveLength(1);
    expect(wrapper.find("input").element.value).toBe("");
    expect(wrapper.find(".vc-popover__body").attributes("style")).toContain("display: none");

    wrapper.unmount();
  });

  it("leaves an open calendar open", async () => {
    const wrapper = mountPicker({ clearable: true }, { attachTo: document.body });

    await wrapper.find('button[aria-label="ui_kit.accessibility.open_calendar"]').trigger("click");
    await flushPromises();
    expect(wrapper.find(".vc-popover__body").attributes("style")).toContain("display: block");

    await wrapper.find(".vc-input__clear").trigger("click");
    await flushPromises();

    expect(wrapper.emitted("clear")).toHaveLength(1);
    expect(wrapper.find("input").element.value).toBe("");
    expect(wrapper.find(".vc-popover__body").attributes("style")).toContain("display: block");

    wrapper.unmount();
  });
});

// The shape both filter drawers ship: a picker inside a dialog popover, so Escape really travels from
// the date field up to the dialog (VCST-5869).
const DialogHost = defineComponent({
  components: { VcDatePicker, VcPopover },

  template: `
    <VcPopover role="dialog" aria-label="Filters">
      <template #default="{ triggerProps }">
        <button class="trigger" v-bind="triggerProps">Open</button>
      </template>

      <template #content>
        <VcDatePicker label="Start date" />
      </template>
    </VcPopover>
  `,
});

function mountInDialog() {
  return mount(DialogHost, {
    attachTo: document.body,
    global: {
      components: { VcDateInput, VcInput, VcInputDetails, VcLabel, VcButton, VcPopover, VcCalendar },
      stubs: { VcIcon: true, VcTooltip: true },
      directives: { "html-safe": {} },
      mocks: { $t: (key: string) => key },
    },
  });
}

type DialogWrapperType = ReturnType<typeof mountInDialog>;

// Named, not positional: once the calendar is open there are two panels on the page.
function panelIsOpen(wrapper: DialogWrapperType, name: string): boolean {
  return !wrapper.get(`.vc-popover__body[aria-label="${name}"]`).attributes("style")?.includes("display: none");
}

const CALENDAR_BUTTON = 'button[aria-label="ui_kit.accessibility.open_calendar"]';

async function openDialog(wrapper: DialogWrapperType) {
  await wrapper.get("button.trigger").trigger("click");
  await nextTick();
}

describe("VcDatePicker inside a dialog popover", () => {
  it("lets Escape reach the dialog while its calendar is closed", async () => {
    const wrapper = mountInDialog();
    await openDialog(wrapper);

    await wrapper.get('input[role="combobox"]').trigger("keydown", { key: "Escape" });
    await nextTick();

    expect(panelIsOpen(wrapper, "Filters")).toBe(false);
  });

  it("consumes Escape while its calendar is open, leaving the dialog open", async () => {
    const wrapper = mountInDialog();
    await openDialog(wrapper);

    await wrapper.get(CALENDAR_BUTTON).trigger("click");
    await flushPromises();
    expect(panelIsOpen(wrapper, "ui_kit.accessibility.calendar")).toBe(true);

    await wrapper.get('input[role="combobox"]').trigger("keydown", { key: "Escape" });
    await nextTick();

    expect(panelIsOpen(wrapper, "ui_kit.accessibility.calendar")).toBe(false);
    expect(panelIsOpen(wrapper, "Filters")).toBe(true);
  });

  it("consumes Escape from the calendar button too, which sits outside the input's listener", async () => {
    const wrapper = mountInDialog();
    await openDialog(wrapper);

    await wrapper.get(CALENDAR_BUTTON).trigger("click");
    await flushPromises();
    expect(panelIsOpen(wrapper, "ui_kit.accessibility.calendar")).toBe(true);

    await wrapper.get(CALENDAR_BUTTON).trigger("keydown", { key: "Escape" });
    await nextTick();

    expect(panelIsOpen(wrapper, "ui_kit.accessibility.calendar")).toBe(false);
    expect(panelIsOpen(wrapper, "Filters")).toBe(true);
  });

  // The one path where three handlers want the same key: VcCalendar's own `.stop`, the popover's panel
  // listener, and the picker's focus return. Opening from the calendar button is what makes the owners
  // disagree — the popover would restore the button, the picker insists on the field.
  it.each([
    ["the field", 'input[role="combobox"]'],
    ["the calendar button", CALENDAR_BUTTON],
  ])("consumes Escape from inside the grid and puts focus on the field, opened from %s", async (_name, openedFrom) => {
    const wrapper = mountInDialog();
    await openDialog(wrapper);

    (wrapper.get(openedFrom).element as HTMLElement).focus();
    await wrapper.get(CALENDAR_BUTTON).trigger("click");
    await flushPromises();
    expect(panelIsOpen(wrapper, "ui_kit.accessibility.calendar")).toBe(true);

    const cell = wrapper.get("[data-reka-calendar-cell-trigger]");
    (cell.element as HTMLElement).focus();
    await cell.trigger("keydown", { key: "Escape" });
    await nextTick();

    expect(panelIsOpen(wrapper, "ui_kit.accessibility.calendar")).toBe(false);
    expect(panelIsOpen(wrapper, "Filters")).toBe(true);
    expect(document.activeElement).toBe(wrapper.get('input[role="combobox"]').element);
  });
});
