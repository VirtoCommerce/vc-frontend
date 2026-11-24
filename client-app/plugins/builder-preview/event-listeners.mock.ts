import { vi } from "vitest";

/** Vitest's jsdom environment wraps the window's listener methods, so they bypass `EventTarget.prototype`. */
export function spyOnListeners(method: "addEventListener" | "removeEventListener"): () => unknown[][] {
  const spies = [vi.spyOn(EventTarget.prototype, method), vi.spyOn(window, method)];

  return () =>
    spies.flatMap((spy) => spy.mock.calls.map(([type, listener], index) => [spy.mock.contexts[index], type, listener]));
}
