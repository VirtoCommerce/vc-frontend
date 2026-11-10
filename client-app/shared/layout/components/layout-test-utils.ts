import type { VueWrapper } from "@vue/test-utils";

export const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

export const focusOrder = (wrapper: VueWrapper) =>
  wrapper
    .findAll(FOCUSABLE)
    .map((el) =>
      `${el.element.closest(".skip-to-links") ? "skip-to-links" : el.element.tagName.toLowerCase()} ${el.attributes("href") ?? ""}`.trim(),
    );
