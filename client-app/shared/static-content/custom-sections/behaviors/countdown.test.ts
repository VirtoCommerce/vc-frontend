import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from "vitest";
import { defineComponent, h, nextTick, ref, withDirectives } from "vue";
import { vCountdown } from "./countdown";

const NOW = new Date("2026-11-21T12:00:00Z");
const IN_A_DAY = "2026-11-22T14:03:04Z";

function mountCountdown(end: string, units: string[]) {
  return mount(
    defineComponent({
      setup: () => () =>
        withDirectives(
          h(
            "div",
            units.map((unit) => h("span", { "data-countdown-part": unit })),
          ),
          [[vCountdown, end]],
        ),
    }),
  );
}

/** Runs a test in a time zone other than UTC, where a date read as local time ends at another moment. */
function inTimeZone(timeZone: string): void {
  const initial = process.env.TZ;
  process.env.TZ = timeZone;
  onTestFinished(() => {
    if (initial === undefined) {
      delete process.env.TZ;
    } else {
      process.env.TZ = initial;
    }
  });
}

function readParts(wrapper: Pick<ReturnType<typeof mountCountdown>, "findAll">): string[] {
  return wrapper.findAll("span").map((part) => part.text());
}

enableAutoUnmount(afterEach);

describe("vCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: NOW });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the time left in its parts and ticks every second", async () => {
    const wrapper = mountCountdown(IN_A_DAY, ["days", "hours", "minutes", "seconds"]);
    await nextTick();
    expect(readParts(wrapper)).toEqual(["1", "02", "03", "04"]);

    await vi.advanceTimersByTimeAsync(1000);

    expect(readParts(wrapper)).toEqual(["1", "02", "03", "03"]);
  });

  it("is a timer screen readers read when asked, never at each tick", async () => {
    const wrapper = mountCountdown(IN_A_DAY, ["seconds"]);
    await nextTick();

    expect(wrapper.attributes()).toMatchObject({ role: "timer", "aria-live": "off" });
  });

  it("counts the larger units into the largest part shown", async () => {
    const wrapper = mountCountdown(IN_A_DAY, ["hours", "minutes"]);
    await nextTick();

    expect(readParts(wrapper)).toEqual(["26", "03"]);
  });

  it("sets data-ended once the date passes", async () => {
    const wrapper = mountCountdown("2026-11-21T12:00:02Z", ["seconds"]);
    await nextTick();
    expect(wrapper.attributes("data-ended")).toBeUndefined();

    await vi.advanceTimersByTimeAsync(2000);

    expect(wrapper.attributes("data-ended")).toBe("");
    expect(readParts(wrapper)).toEqual(["0"]);
  });

  it.each(["2026-12-24", " 2026-12-24 "])(
    "ends a date with no time at 00:00 UTC of that day, the same moment for every visitor: %j",
    async (end) => {
      inTimeZone("America/New_York");
      vi.setSystemTime(new Date("2026-12-23T23:59:59Z"));
      const wrapper = mountCountdown(end, ["seconds"]);
      await nextTick();
      expect([wrapper.attributes("data-ended"), readParts(wrapper)]).toEqual([undefined, ["1"]]);

      await vi.advanceTimersByTimeAsync(1000);

      expect(wrapper.attributes("data-ended")).toBe("");
    },
  );

  it("shows the time left in the element itself when it is a part", async () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () => withDirectives(h("span", { "data-countdown-part": "hours" }), [[vCountdown, IN_A_DAY]]),
      }),
    );
    await nextTick();

    expect(wrapper.text()).toBe("26");
  });

  it("writes only the parts whose value changed", async () => {
    const wrapper = mountCountdown(IN_A_DAY, ["days", "seconds"]);
    await nextTick();
    const written: string[] = [];
    const observer = new MutationObserver((records) =>
      records.forEach(({ target }) => written.push((target as HTMLElement).dataset.countdownPart ?? "")),
    );
    observer.observe(wrapper.element, { subtree: true, childList: true });

    await vi.advanceTimersByTimeAsync(1000);
    observer.disconnect();

    expect(written).toEqual(["seconds"]);
  });

  it("stops ticking once the date passes, yet fills a part added after", async () => {
    const units = ref(["seconds"]);
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          withDirectives(
            h(
              "div",
              units.value.map((unit) => h("span", { key: unit, "data-countdown-part": unit })),
            ),
            [[vCountdown, "2026-11-21T12:00:01Z"]],
          ),
      }),
    );
    await vi.advanceTimersByTimeAsync(1000);
    expect(wrapper.attributes("data-ended")).toBe("");
    expect(vi.getTimerCount()).toBe(0);

    units.value = ["minutes", "seconds"];
    await nextTick();

    expect(readParts(wrapper)).toEqual(["0", "00"]);
  });
});
