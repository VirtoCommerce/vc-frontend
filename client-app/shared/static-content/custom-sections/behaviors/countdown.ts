import { useNow } from "@vueuse/core";
import { watchEffect } from "vue";
import { defineBehavior } from "./define-behavior";

const TICK = 1000;

const UNITS = [
  ["days", 86_400_000],
  ["hours", 3_600_000],
  ["minutes", 60_000],
  ["seconds", 1000],
] as const;

/**
 * Children with `data-countdown-part` show the time left until the date; `data-ended` is set when it passes.
 * The largest part shown takes the larger units: without `days`, `hours` counts past 24.
 */
export const vCountdown = defineBehavior((element, { value }) => {
  const now = useNow({ interval: TICK });

  // A timer is announced when asked for, never at every tick.
  if (!element.hasAttribute("role")) {
    element.setAttribute("role", "timer");
  }
  element.setAttribute("aria-live", "off");

  watchEffect(() => {
    const end = Date.parse(value.value);
    const timeLeft = Number.isNaN(end) ? 0 : Math.max(0, end - now.value.getTime());

    element.toggleAttribute("data-ended", !Number.isNaN(end) && timeLeft === 0);
    writeParts(element, timeLeft);
  });
});

function writeParts(element: HTMLElement, timeLeft: number): void {
  const parts = [...element.querySelectorAll<HTMLElement>("[data-countdown-part]")];
  const shownUnits = new Set(parts.map((part) => part.dataset.countdownPart));
  let rest = timeLeft;

  UNITS.filter(([unit]) => shownUnits.has(unit)).forEach(([unit, size], index) => {
    const count = Math.floor(rest / size);
    rest -= count * size;

    // Leading zeros from the second part on: 3 days 04 hours.
    parts
      .filter((part) => part.dataset.countdownPart === unit)
      .forEach((part) => {
        part.textContent = index === 0 ? String(count) : String(count).padStart(2, "0");
      });
  });
}
