import { useMediaQuery, useMouseInElement } from "@vueuse/core";
import { watchEffect } from "vue";
import { clamp, defineBehavior } from "./define-behavior";

const CENTER = 0.5;

/** `--pointer-x` and `--pointer-y` (0–1 inside the element) and `--pointer-active`; off on touch screens. */
export const vPointer = defineBehavior((element, { isReducedMotion }) => {
  const isTouchScreen = useMediaQuery("(hover: none)");

  writePointer(element, CENTER, CENTER, false);

  if (isReducedMotion || isTouchScreen.value) {
    return;
  }

  const { elementX, elementY, elementWidth, elementHeight, isOutside } = useMouseInElement(element);

  watchEffect(() =>
    writePointer(
      element,
      toShare(elementX.value, elementWidth.value),
      toShare(elementY.value, elementHeight.value),
      !isOutside.value,
    ),
  );
});

function toShare(offset: number, size: number): number {
  return size > 0 ? Math.round(clamp(offset / size, 0, 1) * 1000) / 1000 : CENTER;
}

function writePointer(element: HTMLElement, x: number, y: number, isActive: boolean): void {
  element.style.setProperty("--pointer-x", String(x));
  element.style.setProperty("--pointer-y", String(y));
  element.style.setProperty("--pointer-active", isActive ? "1" : "0");
}
