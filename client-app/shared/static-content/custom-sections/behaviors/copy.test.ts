import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, withDirectives } from "vue";
import { createI18n } from "vue-i18n";
import { globals, setGlobals } from "@/core/globals";
import { vCopy } from "./copy";
import type { I18n } from "@/i18n";

const mocks = vi.hoisted(() => ({
  copy: vi.fn(),
  copied: { value: false },
  options: undefined as { copiedDuring?: number } | undefined,
  success: vi.fn(),
}));

vi.mock("@vueuse/core", async (importOriginal) => {
  const { ref } = await import("vue");

  return {
    ...(await importOriginal<typeof import("@vueuse/core")>()),
    useClipboard: (options: { copiedDuring?: number }) => {
      mocks.options = options;
      mocks.copied = ref(false);
      return mocks;
    },
  };
});

vi.mock("@/shared/notification", () => ({ useNotifications: () => ({ success: mocks.success }) }));

function mountCopy(tag = "span", attributes: Record<string, string> = {}) {
  return mount(defineComponent({ setup: () => () => withDirectives(h(tag, attributes, "Copy"), [[vCopy, "CODE10"]]) }));
}

describe("vCopy", () => {
  const initialI18n = globals.i18n;

  beforeEach(() => {
    mocks.copy.mockReset();
    mocks.success.mockReset();
    mocks.options = undefined;
    setGlobals({
      i18n: createI18n({
        legacy: false,
        locale: "de-DE",
        messages: { "de-DE": { common: { messages: { copied_to_clipboard: "Kopiert" } } } },
      }) as unknown as I18n,
    });
  });

  afterEach(() => {
    setGlobals({ i18n: initialI18n });
  });

  it("copies the text on a click and marks the element while the copy is fresh, for 2 seconds", async () => {
    const wrapper = mountCopy();

    await wrapper.trigger("click");
    expect(mocks.copy).toHaveBeenCalledWith("CODE10");
    expect(mocks.options).toMatchObject({ copiedDuring: 2000 });

    mocks.copied.value = true;
    await nextTick();
    expect(wrapper.attributes("data-copied")).toBe("");

    mocks.copied.value = false;
    await nextTick();
    expect(wrapper.attributes("data-copied")).toBeUndefined();
  });

  it("says it copied in a notification, in the page's language, one at a time", async () => {
    const wrapper = mountCopy();

    await wrapper.trigger("click");
    await nextTick();

    expect(mocks.success).toHaveBeenCalledWith(expect.objectContaining({ text: "Kopiert", singleInGroup: true }));
  });

  it.each(["Enter", " "])("is a button for the keyboard: %j copies", async (key) => {
    const wrapper = mountCopy();

    await wrapper.trigger("keydown", { key });

    expect(wrapper.attributes()).toMatchObject({ role: "button", tabindex: "0" });
    expect(mocks.copy).toHaveBeenCalledWith("CODE10");
  });

  it("leaves a link's role and keys alone", async () => {
    const wrapper = mountCopy("a", { href: "/promo" });

    await wrapper.trigger("keydown", { key: "Enter" });

    expect(wrapper.attributes("role")).toBeUndefined();
    expect(wrapper.attributes("tabindex")).toBeUndefined();
    expect(mocks.copy).not.toHaveBeenCalled();
  });
});
