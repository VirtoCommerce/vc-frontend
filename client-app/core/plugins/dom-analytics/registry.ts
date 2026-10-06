import type { Directive } from "vue";

const items = new WeakMap<Element, unknown>();
const listeners = new Set<() => void>();

function setItem(el: Element, value: unknown): void {
  if (items.get(el) === value) {
    return;
  }
  items.set(el, value);
  listeners.forEach((listener) => listener());
}

export function getItem(el: Element): unknown {
  return items.get(el);
}

export function onItemChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const vTrackItem: Directive<Element, unknown> = {
  mounted: (el, { value }) => setItem(el, value),
  updated: (el, { value }) => setItem(el, value),
  beforeUnmount: (el) => items.delete(el),
};
