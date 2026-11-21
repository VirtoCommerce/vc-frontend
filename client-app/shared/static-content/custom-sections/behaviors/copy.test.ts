import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, withDirectives } from "vue";
import { createI18n } from "vue-i18n";
import { globals, setGlobals } from "@/core/globals";
import { vCopy } from "./copy";
import type { I18n } from "@/i18n";

const clipboard = vi.hoisted(() => ({
  copy: vi.fn(),
  copied: { value: false },
  options: undefined as { copiedDuring?: number } | undefined,
}));

vi.mock("@vueuse/core", async (importOriginal) => {
  const { ref } = await import("vue");

  return {
    ...(await importOriginal<typeof import("@vueuse/core")>()),
    useClipboard: (options: { copiedDuring?: number }) => {
      clipboard.options = options;
      clipboard.copied = ref(false);
      return clipboard;
    },
  };
});

function mountCopy(tag = "span", attributes: Record<string, string> = {}) {
  return mount(defineComponent({ setup: () => () => withDirectives(h(tag, attributes, "Copy"), [[vCopy, "CODE10"]]) }));
}

describe("vCopy", () => {
  const initialI18n = globals.i18n;

  beforeEach(() => {
    clipboard.copy.mockReset();
    clipboard.options = undefined;
    document.querySelector("[data-sb-live-region]")?.remove();
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

  it("tells screen readers it copied, in the page's language, through one polite live region", async () => {
    const wrapper = mountCopy();
    const region = () => document.querySelector("[data-sb-live-region]");

    await wrapper.trigger("click");
    await vi.waitFor(() => expect(region()?.textContent).toBe("Kopiert"));
    expect(region()?.getAttribute("aria-live")).toBe("polite");

    await wrapper.trigger("click");
    expect(region()?.textContent).toBe("");
    await vi.waitFor(() => expect(region()?.textContent).toBe("Kopiert"));
    expect(document.querySelectorAll("[data-sb-live-region]")).toHaveLength(1);
  });

  it("copies the text on a click and marks the element while the copy is fresh, for 2 seconds", async () => {
    const wrapper = mountCopy();

    await wrapper.trigger("click");
    expect(clipboard.copy).toHaveBeenCalledWith("CODE10");
    expect(clipboard.options).toMatchObject({ copiedDuring: 2000 });

    clipboard.copied.value = true;
    await nextTick();
    expect(wrapper.attributes("data-copied")).toBe("");

    clipboard.copied.value = false;
    await nextTick();
    expect(wrapper.attributes("data-copied")).toBeUndefined();
  });

  it.each(["Enter", " "])("is a button for the keyboard: %j copies", async (key) => {
    const wrapper = mountCopy();

    await wrapper.trigger("keydown", { key });

    expect(wrapper.attributes()).toMatchObject({ role: "button", tabindex: "0" });
    expect(clipboard.copy).toHaveBeenCalledWith("CODE10");
  });

  it("leaves a link's role and keys alone", async () => {
    const wrapper = mountCopy("a", { href: "/promo" });

    await wrapper.trigger("keydown", { key: "Enter" });

    expect(wrapper.attributes("role")).toBeUndefined();
    expect(wrapper.attributes("tabindex")).toBeUndefined();
    expect(clipboard.copy).not.toHaveBeenCalled();
  });
});
