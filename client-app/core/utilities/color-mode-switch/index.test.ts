import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { switchColorMode } from "./index";

type ViewTransitionStubType = { finished: Promise<void>; resolve: () => void };

const SWITCHING_CLASS = "color-mode-switching";

function stubViewTransitions(): { transitions: ViewTransitionStubType[] } {
  const transitions: ViewTransitionStubType[] = [];

  document.startViewTransition = vi.fn((callback?: unknown) => {
    let resolve = () => {};
    const finished = new Promise<void>((r) => {
      resolve = r;
    });

    transitions.push({ finished, resolve });
    (callback as () => void)();

    return { finished } as unknown as ViewTransition;
  }) as typeof document.startViewTransition;

  return { transitions };
}

function stubReducedMotion(matches: boolean) {
  window.matchMedia = vi.fn(() => ({ matches })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  stubReducedMotion(false);
  window.innerWidth = 1000;
  window.innerHeight = 600;
});

afterEach(() => {
  document.documentElement.className = "";
  document.documentElement.removeAttribute("style");
  // @ts-expect-error -- removing the stub, which the type says is always present
  delete document.startViewTransition;
  vi.restoreAllMocks();
});

describe("switchColorMode", () => {
  it("applies the change straight away when the browser has no view transitions", () => {
    const apply = vi.fn();

    switchColorMode(apply);

    expect(apply).toHaveBeenCalledOnce();
    expect(document.documentElement.classList.contains(SWITCHING_CLASS)).toBe(false);
  });

  it("applies the change straight away when reduced motion is asked for", () => {
    stubViewTransitions();
    stubReducedMotion(true);
    const apply = vi.fn();

    switchColorMode(apply);

    expect(apply).toHaveBeenCalledOnce();
    expect(document.startViewTransition).not.toHaveBeenCalled();
  });

  it("reveals out of the given origin", () => {
    stubViewTransitions();

    switchColorMode(() => {}, { x: 900, y: 40 });

    const { style } = document.documentElement;

    expect(style.getPropertyValue("--color-mode-switch-x")).toBe("900px");
    expect(style.getPropertyValue("--color-mode-switch-y")).toBe("40px");
    // The far corner is (0, 600): 900 across and 560 down.
    expect(style.getPropertyValue("--color-mode-switch-radius")).toBe(`${Math.hypot(900, 560)}px`);
  });

  it("reveals out of the middle of the viewport when there is no origin", () => {
    stubViewTransitions();

    switchColorMode(() => {});

    const { style } = document.documentElement;

    expect(style.getPropertyValue("--color-mode-switch-x")).toBe("500px");
    expect(style.getPropertyValue("--color-mode-switch-y")).toBe("300px");
  });

  it("carries the class only while the transition runs", async () => {
    const { transitions } = stubViewTransitions();

    switchColorMode(() => {});
    expect(document.documentElement.classList.contains(SWITCHING_CLASS)).toBe(true);

    transitions[0].resolve();
    await transitions[0].finished;
    await Promise.resolve();

    expect(document.documentElement.classList.contains(SWITCHING_CLASS)).toBe(false);
  });

  it("keeps the class when a second switch starts before the first one ends", async () => {
    const { transitions } = stubViewTransitions();

    switchColorMode(() => {});
    switchColorMode(() => {});

    transitions[0].resolve();
    await transitions[0].finished;
    await Promise.resolve();

    expect(document.documentElement.classList.contains(SWITCHING_CLASS)).toBe(true);

    transitions[1].resolve();
    await transitions[1].finished;
    await Promise.resolve();

    expect(document.documentElement.classList.contains(SWITCHING_CLASS)).toBe(false);
  });
});
