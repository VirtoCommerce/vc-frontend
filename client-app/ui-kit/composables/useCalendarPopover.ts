import { computed, nextTick, toValue } from "vue";
import type { MaybeRefOrGetter } from "vue";

interface ICalendarExposed {
  focusActiveCell: () => void;
  $el?: Element | null;
}

export interface IUseCalendarPopoverOptions {
  /** Field size; the calendar has no "auto", so it collapses to "md". */
  size: MaybeRefOrGetter<VcInputSizeType>;
  /** Element focus returns to when the popover closes. */
  getFocusTarget: () => HTMLInputElement | null | undefined;
  getCalendar: () => ICalendarExposed | null | undefined;
}

/** Escape/focus wiring shared by VcDatePicker and VcDateRangePicker: both host a calendar in a VcPopover. */
export function useCalendarPopover(opts: IUseCalendarPopoverOptions) {
  const calendarSize = computed<VcCalendarSizeType>(() => {
    const size = toValue(opts.size);
    if (size === "auto") {
      return "md";
    }
    return size;
  });

  function focusField(): void {
    opts.getFocusTarget()?.focus();
  }

  function onToggle(opened: boolean): void {
    if (!opened) {
      // Trigger-click / click-outside closes skip onEscapeClose; focus would stay in the hidden popover.
      const calendarEl = opts.getCalendar()?.$el;
      if (calendarEl instanceof HTMLElement && calendarEl.contains(document.activeElement)) {
        focusField();
      }
      return;
    }
    // VcPopover doesn't focus its content, and it stays display:none until the open flush.
    void nextTick(() => {
      opts.getCalendar()?.focusActiveCell();
    });
  }

  function onEscapeClose(close: () => void): void {
    close();
    focusField();
  }

  // Escape must keep propagating to outer dismissible layers (dialogs, sidebars) while the popover is closed.
  function onFieldEscape(event: Event, opened: boolean, close: () => void): void {
    if (!opened) {
      return;
    }
    event.stopPropagation();
    close();
  }

  function onTriggerEscape(event: Event, opened: boolean, close: () => void): void {
    if (!opened) {
      return;
    }
    event.stopPropagation();
    onEscapeClose(close);
  }

  return {
    calendarSize,
    focusField,
    onToggle,
    onEscapeClose,
    onFieldEscape,
    onTriggerEscape,
  };
}
