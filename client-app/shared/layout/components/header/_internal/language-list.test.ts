import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VcMenuItem } from "@/ui-kit/components/molecules";
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

function mountList() {
  return mount(LanguageList, {
    attachTo: document.body,
    global: {
      components: { VcMenuItem },
      stubs: { VcScrollbar: { template: "<div><slot /></div>" }, VcImage: true },
    },
  });
}

function option(wrapper: ReturnType<typeof mountList>, cultureName: string) {
  return wrapper.get(`[data-culture-name="${cultureName}"] [role="option"]`);
}

beforeEach(() => {
  state.selectLanguage.mockReset();
});

describe("LanguageList", () => {
  it("marks the current language as the selected option", () => {
    const wrapper = mountList();

    expect(["en-US", "de-DE"].map((name) => option(wrapper, name).attributes("aria-selected"))).toEqual([
      "true",
      "false",
    ]);
  });

  it("starts the switch and reports the choice", async () => {
    const wrapper = mountList();

    await option(wrapper, "de-DE").trigger("click");

    expect(state.selectLanguage).toHaveBeenCalledWith("de-DE");
    expect(wrapper.emitted("select")).toHaveLength(1);
  });
});
