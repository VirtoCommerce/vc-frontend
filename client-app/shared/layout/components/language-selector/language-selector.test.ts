import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";
import LanguageSelector from "./language-selector.vue";
import VcImage from "@/ui-kit/components/atoms/image/vc-image.vue";

const en = { cultureName: "en-US", twoLetterLanguageName: "en", nativeName: "English (United States)" };
const de = { cultureName: "de-DE", twoLetterLanguageName: "de", nativeName: "Deutsch (Deutschland)" };
const pl = { cultureName: "pl-PL", twoLetterLanguageName: "pl", nativeName: "polski (Polska)" };

const { getSlugInfo, currentLanguage, previousCultureSlug } = vi.hoisted(() => ({
  getSlugInfo: vi.fn(),
  currentLanguage: {
    value: { cultureName: "en-US", twoLetterLanguageName: "en", nativeName: "English (United States)" },
  },
  previousCultureSlug: { value: { cultureName: "", slug: "" } },
}));

vi.mock("@/core/composables/useLanguages", () => ({
  useLanguages: () => ({
    supportedLanguages: ref([en, de, pl]),
    currentLanguage: ref(currentLanguage.value),
    pinLocale: vi.fn(),
    removeLocaleFromUrl: vi.fn(),
    previousCultureSlug,
    // eslint-disable-next-line sonarjs/null-dereference -- false positive: typed string parameter
    getUrlWithoutLocale: (path: string) => path.replace(/^\/(de|pl)(?=\/|$)/, "") || "/",
  }),
}));

vi.mock("@/core/composables", () => ({
  useThemeContext: () => ({ themeContext: ref(undefined) }),
}));

vi.mock("@/core/api/graphql/slugInfo/queries/getSlugInfo", () => ({ getSlugInfo }));

vi.mock("@/shared/broadcast", () => ({
  dataChangedEvent: "data-changed",
  useBroadcast: () => ({ emit: vi.fn() }),
}));

const VcDropdownMenuStub = defineComponent({
  name: "VcDropdownMenu",
  template: `<div><slot name="trigger" :opened="true" :trigger-props="{}" /><slot name="content" :close="() => {}" /></div>`,
});

const VcMenuItemStub = defineComponent({
  name: "VcMenuItem",
  template: `<div class="menu-item" v-bind="$attrs"><slot /></div>`,
});

function mountSelector() {
  return mount(LanguageSelector, {
    global: {
      components: { VcImage },
      stubs: { VcDropdownMenu: VcDropdownMenuStub, VcMenuItem: VcMenuItemStub, VcIcon: true },
      mocks: { $t: (key: string) => key },
    },
  });
}

describe("LanguageSelector", () => {
  it("renders every option flag as decorative, so each option is named by its own label only", () => {
    const options = mountSelector().findAll(".menu-item");

    expect(options).toHaveLength(3);

    for (const option of options) {
      const img = option.find("img.language-selector__item-img");
      expect(img.exists()).toBe(true);
      // An empty alt marks the flag decorative. The current language's name here gave the German
      // option the accessible name "English (United States) Deutsch".
      expect(img.attributes("alt")).toBe("");
    }
  });

  it("does not put the current language's name on another language's option", () => {
    const german = mountSelector().find('[data-culture-name="de-DE"]');

    expect(german.find("img").attributes("alt")).not.toContain("English");
    expect(german.text()).toContain("Deutsch");
  });

  describe("select", () => {
    const reload = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
      currentLanguage.value = de;
      previousCultureSlug.value = { cultureName: "", slug: "" };
      vi.stubGlobal("location", { pathname: "/de/haeufige-fragen", reload });
    });

    afterEach(() => {
      currentLanguage.value = en;
      vi.unstubAllGlobals();
    });

    async function selectLanguage(cultureName: string) {
      await mountSelector().find(`[data-culture-name="${cultureName}"]`).trigger("click");
      await flushPromises();
    }

    it("looks up the translation by the permalink without the current locale prefix", async () => {
      getSlugInfo.mockResolvedValue({ entityInfo: { id: "faq" } });

      await selectLanguage("en-US");

      expect(getSlugInfo).toHaveBeenCalledWith({ permalink: "haeufige-fragen", cultureName: "en-US" });
      expect(previousCultureSlug.value).toEqual({ cultureName: "", slug: "" });
      expect(reload).toHaveBeenCalled();
    });

    it("does nothing when the current language is selected", async () => {
      await selectLanguage("de-DE");

      expect(getSlugInfo).not.toHaveBeenCalled();
      expect(reload).not.toHaveBeenCalled();
    });

    it("remembers the current language and permalink when the page has no translation", async () => {
      getSlugInfo.mockResolvedValue({ entityInfo: null });

      await selectLanguage("en-US");

      expect(previousCultureSlug.value).toEqual({ cultureName: "de-DE", slug: "haeufige-fragen" });
      expect(reload).toHaveBeenCalled();
    });
  });
});
