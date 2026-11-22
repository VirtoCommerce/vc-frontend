import { mount } from "@vue/test-utils";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, withDirectives } from "vue";
import { vCopy } from "./copy";
import { vCountUp } from "./count-up";
import { vCountdown } from "./countdown";
import { vInview } from "./inview";
import { vMarquee } from "./marquee";
import { vPointer } from "./pointer";
import { vScrollProgress } from "./scroll-progress";
import type { CustomSectionDirectiveType } from "../types";

vi.mock("@/shared/notification", () => ({ useNotifications: () => ({ success: vi.fn() }) }));

const observers: FakeObserver[] = [];

/** Stands in for IntersectionObserver and ResizeObserver, which jsdom does not have. */
class FakeObserver {
  isConnected = true;

  constructor(readonly callback: (entries: unknown[]) => void) {
    observers.push(this);
  }

  observe(): void {}
  unobserve(): void {}
  takeRecords(): unknown[] {
    return [];
  }

  disconnect(): void {
    this.isConnected = false;
  }
}

const BEHAVIORS: [string, CustomSectionDirectiveType, string][] = [
  ["inview", vInview, ""],
  ["scroll-progress", vScrollProgress, ""],
  ["pointer", vPointer, ""],
  ["count-up", vCountUp, "120"],
  ["countdown", vCountdown, "2026-11-22T00:00:00Z"],
  ["copy", vCopy, "CODE10"],
  ["marquee", vMarquee, ""],
];

function mountBehavior(directive: CustomSectionDirectiveType, value: string) {
  return mount(
    defineComponent({
      setup: () => () =>
        withDirectives(h("div", [h("span", { "data-countdown-part": "seconds" }, "A")]), [[directive, value]]),
    }),
  );
}

/** Every observer still connected, listener still attached and timer or frame still pending. */
function getHeldResources(): string[] {
  // The window's listener methods are its own, so they are watched apart from every other target's.
  const listeners = [EventTarget.prototype, window].flatMap((owner) => {
    const added = vi.mocked(owner.addEventListener).mock;
    const removed = vi.mocked(owner.removeEventListener).mock;

    return added.calls
      .filter(
        ([type, listener], index) =>
          !removed.calls.some(
            ([removedType, removedListener], removedIndex) =>
              removedType === type &&
              removedListener === listener &&
              removed.contexts[removedIndex] === added.contexts[index],
          ),
      )
      .map(([type]) => `listener ${type}`);
  });

  return [
    ...observers.filter((observer) => observer.isConnected).map(() => "observer"),
    ...listeners,
    ...Array.from({ length: vi.getTimerCount() }, () => "timer"),
  ];
}

describe("a behavior, once its element unmounts", () => {
  beforeAll(() => {
    // jsdom's selector engine listens on the window for good the first time a style is read: before the spies.
    getComputedStyle(document.body);
  });

  beforeEach(() => {
    vi.useFakeTimers({
      now: new Date("2026-11-21T12:00:00Z"),
      toFake: [
        "setTimeout",
        "clearTimeout",
        "setInterval",
        "clearInterval",
        "requestAnimationFrame",
        "cancelAnimationFrame",
        "Date",
      ],
    });
    vi.stubGlobal("IntersectionObserver", FakeObserver);
    vi.stubGlobal("ResizeObserver", FakeObserver);
    // A media query list is an event target, so its listeners count as the window's and the elements' do.
    vi.stubGlobal("matchMedia", (media: string) => Object.assign(new EventTarget(), { matches: false, media }));
    observers.length = 0;

    for (const owner of [EventTarget.prototype, window]) {
      vi.spyOn(owner, "addEventListener");
      vi.spyOn(owner, "removeEventListener");
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it.each(BEHAVIORS)("%s holds no observer, listener or timer", async (_, directive, value) => {
    const wrapper = mountBehavior(directive, value);
    const element = wrapper.element as HTMLElement;
    await nextTick();

    const rect = element.getBoundingClientRect();
    const entry = { isIntersecting: true, intersectionRatio: 1, target: element, intersectionRect: rect };
    observers.forEach(({ callback }) => callback([{ ...entry, boundingClientRect: rect, rootBounds: rect }]));
    ["pointermove", "mouseenter", "focusin"].forEach((type) => element.dispatchEvent(new Event(type)));
    window.dispatchEvent(new Event("scroll"));
    await nextTick();
    expect(getHeldResources()).not.toEqual([]);

    wrapper.unmount();
    window.dispatchEvent(new Event("scroll"));
    // A transition under way sees its scope gone at its next frame, and asks for none after it.
    vi.advanceTimersToNextFrame();

    expect(getHeldResources()).toEqual([]);
  });
});
