import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { VcMenuItem, VcMenuList } from "@/ui-kit/components/molecules";
import LanguageList from "./language-list.vue";

const state = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    currentLanguage: ref({ cultureName: "en-US", nativeName: "English" }),
    supportedLanguages: ref([
      { cultureName: "en-US", nativeName: "English" },
      { cultureName: "de-DE", nativeName: "Deutsch" },
    ]),
    selectLanguage: vi.fn(),
  };
});

vi.mock("@/shared/layout/composables/useLanguageSwitch", () => ({
  useLanguageSwitch: () => ({
    currentLanguage: state.currentLanguage,
    supportedLanguages: state.supportedLanguages,
    selectLanguage: state.selectLanguage,
    getCountryCode: () => "xx",
    getLanguageName: (language: { nativeName: string }) => language.nativeName,
  }),
}));

enableAutoUnmount(afterEach);

async function mountList() {
  const wrapper = mount(LanguageList, {
    attachTo: document.body,
    attrs: { "aria-labelledby": "language-heading" },
    global: {
      components: { VcMenuItem, VcMenuList },
      stubs: { VcScrollbar: { template: "<div><slot /></div>" }, VcImage: true },
    },
  });
  // The options join the listbox once they are in the DOM.
  await nextTick();
  return wrapper;
}

function option(wrapper: Awaited<ReturnType<typeof mountList>>, cultureName: string) {
  return wrapper.get(`[data-culture-name="${cultureName}"] [role="option"]`);
}

beforeEach(() => {
  state.currentLanguage.value = { cultureName: "en-US", nativeName: "English" };
  state.selectLanguage.mockReset();
});

describe("LanguageList", () => {
  it("is a listbox named by the heading its parent gives", async () => {
    const listbox = (await mountList()).get('[role="listbox"]');

    expect(listbox.attributes("aria-labelledby")).toBe("language-heading");
    expect(listbox.attributes("data-test-id")).toBe("preferences-menu-languages");
  });

  it("marks the current language as the selected option", async () => {
    const wrapper = await mountList();

    expect(["en-US", "de-DE"].map((name) => option(wrapper, name).attributes("aria-selected"))).toEqual([
      "true",
      "false",
    ]);
  });

  it("is one tab stop: the current language", async () => {
    state.currentLanguage.value = { cultureName: "de-DE", nativeName: "Deutsch" };
    const wrapper = await mountList();

    expect(["en-US", "de-DE"].map((name) => option(wrapper, name).attributes("tabindex"))).toEqual(["-1", "0"]);
  });

  it("starts the switch and reports the choice", async () => {
    const wrapper = await mountList();

    await option(wrapper, "de-DE").trigger("click");

    expect(state.selectLanguage).toHaveBeenCalledWith("de-DE");
    expect(wrapper.emitted("select")).toHaveLength(1);
  });
});
