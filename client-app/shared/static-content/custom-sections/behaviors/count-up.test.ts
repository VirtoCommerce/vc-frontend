import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, withDirectives } from "vue";
import { createI18n } from "vue-i18n";
import { globals, setGlobals } from "@/core/globals";
import { vCountUp } from "./count-up";
import type { I18n } from "@/i18n";

const mocks = vi.hoisted(() => ({
  motion: "no-preference",
  onIntersect: undefined as ((entries: { isIntersecting: boolean }[]) => void) | undefined,
  stop: vi.fn(),
}));

vi.mock("@vueuse/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@vueuse/core")>()),
  usePreferredReducedMotion: () => ({
    get value() {
      return mocks.motion;
    },
  }),
  useIntersectionObserver: (_target: unknown, callback: (entries: { isIntersecting: boolean }[]) => void) => {
    mocks.onIntersect = callback;
    return { stop: mocks.stop };
  },
}));

function readCount(wrapper: ReturnType<typeof mountCounter>): { shown: string; read: string } {
  return { shown: wrapper.find('[aria-hidden="true"]').text(), read: wrapper.find(".sr-only").text() };
}

function mountCounter(value: string, attributes: Record<string, string> = {}) {
  return mount(
    defineComponent({
      props: { value: { type: String, required: true } },
      setup: (props) => () => withDirectives(h("span", attributes), [[vCountUp, props.value]]),
    }),
    { props: { value } },
  );
}

describe("vCountUp", () => {
  const initialI18n = globals.i18n;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date", "requestAnimationFrame", "cancelAnimationFrame", "setTimeout"] });
    mocks.motion = "no-preference";
    mocks.onIntersect = undefined;
    mocks.stop.mockClear();
    setGlobals({
      i18n: createI18n({
        legacy: false,
        locale: "de-DE",
        numberFormats: { "de-DE": { decimal: { style: "decimal" } } },
      }) as unknown as I18n,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    setGlobals({ i18n: initialI18n });
  });

  it("shows zero until the element shows, then counts up to the number in the page's language", async () => {
    const wrapper = mountCounter("1234.5", { "data-count-up-decimals": "1", "data-count-up-duration": "1000" });
    await nextTick();
    expect(readCount(wrapper).shown).toBe("0,0");

    mocks.onIntersect?.([{ isIntersecting: true }]);
    await nextTick();
    await vi.advanceTimersByTimeAsync(500);
    const halfway = Number(readCount(wrapper).shown.replaceAll(".", "").replace(",", "."));
    expect(halfway).toBeGreaterThan(0);
    expect(halfway).toBeLessThan(1234.5);

    await vi.advanceTimersByTimeAsync(600);
    expect(readCount(wrapper).shown).toBe("1.234,5");
    expect(mocks.stop).toHaveBeenCalled();
  });

  it("gives screen readers the number it counts to at once, and hides the count from them", async () => {
    const wrapper = mountCounter("1234.5", { "data-count-up-decimals": "1" });
    await nextTick();

    expect(readCount(wrapper)).toEqual({ shown: "0,0", read: "1.234,5" });
  });

  it("does not count before the element shows", async () => {
    const wrapper = mountCounter("50");
    mocks.onIntersect?.([{ isIntersecting: false }]);
    await vi.advanceTimersByTimeAsync(2000);

    expect(readCount(wrapper).shown).toBe("0");
  });

  it("shows the number at once with reduced motion", async () => {
    mocks.motion = "reduce";

    const wrapper = mountCounter("50");
    await nextTick();

    expect(readCount(wrapper).shown).toBe("50");
    expect(mocks.onIntersect).toBeUndefined();
  });

  it("shows a value that is no number as it is", async () => {
    const wrapper = mountCounter("many");
    await nextTick();

    expect(readCount(wrapper)).toEqual({ shown: "many", read: "many" });
  });
});
