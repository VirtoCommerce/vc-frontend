import { TransitionPresets, useIntersectionObserver, useTransition } from "@vueuse/core";
import { shallowRef, watchEffect } from "vue";
import { globals } from "@/core/globals";
import { toFiniteNumber } from "../numbers";
import { defineBehavior } from "./define-behavior";

const DEFAULT_DURATION = 1500;

/** The text counts up to the number, in the page's language, when the element first shows. */
export const vCountUp = defineBehavior((element, { value, isReducedMotion }) => {
  const decimals = Math.round(toFiniteNumber(element.getAttribute("data-count-up-decimals")) ?? 0);
  const duration = toFiniteNumber(element.getAttribute("data-count-up-duration")) ?? DEFAULT_DURATION;
  const target = toFiniteNumber(value) ?? Number.NaN;
  const hasShown = shallowRef(isReducedMotion);
  const shown = useTransition(() => (hasShown.value && Number.isFinite(target) ? target : 0), {
    duration,
    transition: TransitionPresets.easeOutCubic,
    disabled: isReducedMotion,
  });

  // Assistive technology reads the number it counts to at once, not each step of the count.
  const steps = element.ownerDocument.createElement("span");
  const result = element.ownerDocument.createElement("span");
  steps.setAttribute("aria-hidden", "true");
  result.className = "sr-only";
  element.replaceChildren(steps, result);

  // A value that is no number shows as it is.
  watchEffect(() => {
    const isNumber = Number.isFinite(target);

    steps.textContent = isNumber ? formatNumber(shown.value, decimals) : value;
    result.textContent = isNumber ? formatNumber(target, decimals) : value;
  });

  if (!isReducedMotion) {
    const { stop } = useIntersectionObserver(element, ([entry]) => {
      if (entry?.isIntersecting) {
        hasShown.value = true;
        stop();
      }
    });
  }
});

function formatNumber(value: number, decimals: number): string {
  const options = { key: "decimal", minimumFractionDigits: decimals, maximumFractionDigits: decimals };
  return globals.i18n?.global.n(value, options) ?? String(value);
}
