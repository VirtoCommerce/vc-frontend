import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, withDirectives } from "vue";
import { createI18n } from "vue-i18n";
import { globals, setGlobals } from "@/core/globals";
import { vCopy } from "./copy";
import type { I18n } from "@/i18n";

const mocks = vi.hoisted(() => ({ success: vi.fn(), writeText: vi.fn() }));

vi.mock("@/shared/notification", () => ({ useNotifications: () => ({ success: mocks.success }) }));

function mountCopy(tag = "span", attributes: Record<string, string> = {}) {
  return mount(
    defineComponent({
      setup: () => () =>
        withDirectives(h(tag, attributes, ["Copy", h("a", { href: "/terms" }, "Terms")]), [[vCopy, "CODE10"]]),
    }),
  );
}

describe("vCopy", () => {
  const initialI18n = globals.i18n;

  beforeEach(() => {
    vi.useFakeTimers();
    mocks.success.mockReset();
    mocks.writeText.mockReset().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText: mocks.writeText }, configurable: true });
    setGlobals({
      i18n: createI18n({
        legacy: false,
        locale: "de-DE",
        messages: { "de-DE": { common: { messages: { copied_to_clipboard: "Kopiert" } } } },
      }) as unknown as I18n,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    Reflect.deleteProperty(navigator, "clipboard");
    setGlobals({ i18n: initialI18n });
  });

  it("copies the text on a click and marks the element while the copy is fresh, for 2 seconds", async () => {
    const wrapper = mountCopy();

    await wrapper.trigger("click");
    await flushPromises();
    expect(mocks.writeText).toHaveBeenCalledWith("CODE10");
    expect(wrapper.attributes("data-copied")).toBe("");

    await vi.advanceTimersByTimeAsync(2000);
    expect(wrapper.attributes("data-copied")).toBeUndefined();
  });

  it("says it copied in a notification, in the page's language, one at a time", async () => {
    const wrapper = mountCopy();

    await wrapper.trigger("click");
    await flushPromises();

    expect(mocks.success).toHaveBeenCalledWith(expect.objectContaining({ text: "Kopiert", singleInGroup: true }));
  });

  it("says nothing and marks nothing when the browser refuses the copy", async () => {
    mocks.writeText.mockRejectedValue(new DOMException("Denied", "NotAllowedError"));
    const wrapper = mountCopy();

    await wrapper.trigger("click");
    await flushPromises();

    expect(mocks.success).not.toHaveBeenCalled();
    expect(wrapper.attributes("data-copied")).toBeUndefined();
  });

  it.each(["Enter", " "])("is a button for the keyboard: %j copies", async (key) => {
    const wrapper = mountCopy();

    await wrapper.trigger("keydown", { key });

    expect(wrapper.attributes()).toMatchObject({ role: "button", tabindex: "0" });
    expect(mocks.writeText).toHaveBeenCalledWith("CODE10");
  });

  it("leaves Enter on a link inside it to the link", async () => {
    const wrapper = mountCopy();

    await wrapper.find("a").trigger("keydown", { key: "Enter" });

    expect(mocks.writeText).not.toHaveBeenCalled();
  });

  it("leaves a link's role and keys alone", async () => {
    const wrapper = mountCopy("a", { href: "/promo" });

    await wrapper.trigger("keydown", { key: "Enter" });

    expect(wrapper.attributes("role")).toBeUndefined();
    expect(wrapper.attributes("tabindex")).toBeUndefined();
    expect(mocks.writeText).not.toHaveBeenCalled();
  });
});
