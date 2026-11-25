import { useNow } from "@vueuse/core";
import { watch } from "vue";
import { COUNTDOWN_PARTS } from "./constants";
import { defineBehavior } from "./define-behavior";

const TICK = 1000;
const PART_SELECTOR = "[data-countdown-part]";

const PART_SIZES: Record<(typeof COUNTDOWN_PARTS)[number], number> = {
  days: 86_400_000,
  hours: 3_600_000,
  minutes: 60_000,
  seconds: 1000,
};

/**
 * Elements with `data-countdown-part`, inside it or the element itself, show the time left until the date;
 * `data-ended` is set when it passes, and the ticking stops. The largest part shown takes the larger units: without
 * `days`, `hours` counts past 24.
 */
export const vCountdown = defineBehavior((element, { value, updates }) => {
  const { now, pause } = useNow({ interval: TICK, controls: true });

  // A timer is announced when asked for, never at every tick.
  if (!element.hasAttribute("role")) {
    element.setAttribute("role", "timer");
  }
  element.setAttribute("aria-live", "off");

  // Trimmed as the field check reads it: with a space around it, a date alone parses as local midnight.
  const end = Date.parse(value.trim());

  // Also on an update: its parts may change without a remount, after the end too.
  watch(
    [now, updates],
    ([date]) => {
      const timeLeft = Number.isNaN(end) ? 0 : Math.max(0, end - date.getTime());

      element.toggleAttribute("data-ended", !Number.isNaN(end) && timeLeft === 0);
      writeParts(element, timeLeft);

      if (timeLeft === 0) {
        pause();
      }
    },
    { immediate: true },
  );
});

function writeParts(element: HTMLElement, timeLeft: number): void {
  const parts = [...element.querySelectorAll<HTMLElement>(PART_SELECTOR)];

  if (element.matches(PART_SELECTOR)) {
    parts.unshift(element);
  }

  const shownUnits = new Set(parts.map((part) => part.dataset.countdownPart));
  let rest = timeLeft;

  COUNTDOWN_PARTS.filter((unit) => shownUnits.has(unit)).forEach((unit, index) => {
    const size = PART_SIZES[unit];
    const count = Math.floor(rest / size);
    rest -= count * size;

    // Leading zeros from the second part on: 3 days 04 hours.
    parts
      .filter((part) => part.dataset.countdownPart === unit)
      .forEach((part) => {
        const text = index === 0 ? String(count) : String(count).padStart(2, "0");

        // Only on a change: a marquee around it watches its children.
        if (part.textContent !== text) {
          part.textContent = text;
        }
      });
  });
}
