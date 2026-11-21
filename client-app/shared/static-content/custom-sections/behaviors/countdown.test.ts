import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, withDirectives } from "vue";
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

function readParts(wrapper: ReturnType<typeof mountCountdown>): string[] {
  return wrapper.findAll("span").map((part) => part.text());
}

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
});
