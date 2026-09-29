import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";
import LanguageSelector from "./language-selector.vue";
import VcImage from "@/ui-kit/components/atoms/image/vc-image.vue";

const en = { cultureName: "en-US", twoLetterLanguageName: "en", nativeName: "English (United States)" };
const de = { cultureName: "de-DE", twoLetterLanguageName: "de", nativeName: "Deutsch (Deutschland)" };
const pl = { cultureName: "pl-PL", twoLetterLanguageName: "pl", nativeName: "polski (Polska)" };

vi.mock("@/core/composables/useLanguages", () => ({
  useLanguages: () => ({
    supportedLanguages: ref([en, de, pl]),
    currentLanguage: ref(en),
    pinLocale: vi.fn(),
    removeLocaleFromUrl: vi.fn(),
    previousCultureSlug: ref({ cultureName: "", slug: "" }),
    getUrlWithoutLocale: (path: string) => path,
  }),
}));

vi.mock("@/core/composables", () => ({
  useThemeContext: () => ({ themeContext: ref(undefined) }),
}));

vi.mock("@/core/api/graphql/slugInfo/queries/getSlugInfo", () => ({ getSlugInfo: vi.fn() }));

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
});
