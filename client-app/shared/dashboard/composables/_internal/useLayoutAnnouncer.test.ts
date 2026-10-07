import { describe, expect, it, vi } from "vitest";
import { useLayoutAnnouncer } from "./useLayoutAnnouncer";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    // Echo the key plus its params, so assertions can see which string was chosen.
    t: (key: string, params?: Record<string, unknown>) => (params ? `${key}(${JSON.stringify(params)})` : key),
  }),
}));

const ZERO_WIDTH_SPACE = "\u200B";
// eslint-disable-next-line sonarjs/null-dereference -- rule misfires on string methods repo-wide
const strip = (text: string) => text.replaceAll(ZERO_WIDTH_SPACE, "");

describe("useLayoutAnnouncer", () => {
  it("counts positions from one, not zero", () => {
    const { message, announce } = useLayoutAnnouncer("announcerSpec");

    announce({ kind: "moved", id: "probe", index: 0, total: 4 });

    expect(strip(message.value)).toContain('"position":1');
    expect(strip(message.value)).toContain('"total":4');
  });

  it("uses the parkable wording only where hiding is possible", () => {
    const { message, announce } = useLayoutAnnouncer("announcerSpec");

    announce({ kind: "grabbed", id: "probe", index: 0, total: 4, parkable: true });
    expect(message.value).toContain("a11y.grabbed_parkable");

    announce({ kind: "grabbed", id: "probe", index: 0, total: 4, parkable: false });
    expect(strip(message.value)).toContain("a11y.grabbed(");
    expect(message.value).not.toContain("grabbed_parkable");
  });

  // An aria-live region is only spoken when its text changes, so the same announcement twice running
  // would be silent the second time.
  it("keeps a repeated announcement audible by changing the text without changing the words", () => {
    const { message, announce } = useLayoutAnnouncer("announcerSpec");

    announce({ kind: "cancelled", id: "probe" });
    const first = message.value;

    announce({ kind: "cancelled", id: "probe" });
    const second = message.value;

    expect(second).not.toBe(first);
    expect(strip(second)).toBe(strip(first));

    // And a third time flips back, rather than growing without bound.
    announce({ kind: "cancelled", id: "probe" });
    expect(message.value).toBe(first);
    expect(strip(message.value)).toBe(strip(first));
  });

  it("announces a blocked move at the end of a list", () => {
    const { message, announce } = useLayoutAnnouncer("announcerSpec");

    announce({ kind: "edge", id: "probe", index: 0, total: 4 });

    expect(message.value).toContain("a11y.edge");
  });
});
