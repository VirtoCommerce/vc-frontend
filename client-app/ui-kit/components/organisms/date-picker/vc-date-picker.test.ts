import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, nextTick } from "vue";
import { createWrapperFactory } from "@/core/utilities/tests";
import { VcIcon, VcInputDetails, VcLabel, VcScrollbar, VcTooltip } from "@/ui-kit/components/atoms";
import { VcButton, VcCalendar, VcDateInput, VcInput, VcPopover } from "@/ui-kit/components/molecules";
import { VcDatePicker } from "@/ui-kit/components/organisms";
import type { VueWrapper } from "@vue/test-utils";

// A failed assertion skips a trailing unmount(), and these suites read document.activeElement.
enableAutoUnmount(afterEach);

// The shape the filter drawers ship: a date picker inside a dialog popover, so Escape really
// travels from the date field up to the dialog.
const Host = defineComponent({
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

const createWrapper = createWrapperFactory(mount, Host, {
  attachTo: document.body,
  global: {
    components: {
      VcButton,
      VcCalendar,
      VcDateInput,
      VcIcon,
      VcInput,
      VcInputDetails,
      VcLabel,
      VcPopover,
      VcScrollbar,
      VcTooltip,
    },
  },
});

const DIALOG_NAME = "Filters";

function dialogIsOpen(wrapper: VueWrapper): boolean {
  return !wrapper.get(`.vc-popover__body[aria-label="${DIALOG_NAME}"]`).attributes("style")?.includes("display: none");
}

// The calendar panel is named through i18n, which resolves to the raw key in tests. `get` rather
// than `find`: a missing panel is a broken fixture, not a closed calendar.
const CALENDAR_NAME = "ui_kit.accessibility.calendar";

function calendarIsOpen(wrapper: VueWrapper): boolean {
  return !wrapper
    .get(`.vc-popover__body[aria-label="${CALENDAR_NAME}"]`)
    .attributes("style")
    ?.includes("display: none");
}

async function openDialog(wrapper: VueWrapper) {
  await wrapper.get("button.trigger").trigger("click");
  await nextTick();
}

describe("VcDatePicker inside a dialog popover", () => {
  it("lets Escape reach the dialog while its calendar is closed", async () => {
    const wrapper = createWrapper();
    await openDialog(wrapper);

    await wrapper.get('input[role="combobox"]').trigger("keydown", { key: "Escape" });
    await nextTick();

    expect(dialogIsOpen(wrapper)).toBe(false);
  });

  // The one path where three handlers want the same key: VcCalendar's own `.stop`, the popover's
  // panel listener, and onEscapeClose's focus return. Opening from the calendar button is what makes
  // the owners disagree — the popover would restore the button, the picker insists on the field.
  it.each([
    ["the field", 'input[role="combobox"]'],
    ["the calendar button", ".vc-input__decorator button"],
  ])("consumes Escape from inside the grid and puts focus on the field, opened from %s", async (_name, openedFrom) => {
    const wrapper = createWrapper();
    await openDialog(wrapper);

    (wrapper.get(openedFrom).element as HTMLElement).focus();
    await wrapper.get(".vc-input__decorator button").trigger("click");
    await nextTick();
    expect(calendarIsOpen(wrapper)).toBe(true);

    const cell = wrapper.get("[data-reka-calendar-cell-trigger]");
    (cell.element as HTMLElement).focus();
    await cell.trigger("keydown", { key: "Escape" });
    await nextTick();

    expect(calendarIsOpen(wrapper)).toBe(false);
    expect(dialogIsOpen(wrapper)).toBe(true);
    expect(document.activeElement).toBe(wrapper.get('input[role="combobox"]').element);
  });

  it("consumes Escape from the calendar button too, which sits outside the input's listener", async () => {
    const wrapper = createWrapper();
    await openDialog(wrapper);

    const calendarButton = wrapper.get(".vc-input__decorator button");
    await calendarButton.trigger("click");
    await nextTick();
    expect(calendarIsOpen(wrapper)).toBe(true);

    await calendarButton.trigger("keydown", { key: "Escape" });
    await nextTick();

    expect(calendarIsOpen(wrapper)).toBe(false);
    expect(dialogIsOpen(wrapper)).toBe(true);
  });

  it("consumes Escape while its calendar is open, leaving the dialog open", async () => {
    const wrapper = createWrapper();
    await openDialog(wrapper);

    await wrapper.get(".vc-input__decorator button").trigger("click");
    await nextTick();
    expect(calendarIsOpen(wrapper)).toBe(true);

    await wrapper.get('input[role="combobox"]').trigger("keydown", { key: "Escape" });
    await nextTick();

    expect(calendarIsOpen(wrapper)).toBe(false);
    expect(dialogIsOpen(wrapper)).toBe(true);
  });
});
