import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";
import LanguageSelector from "./language-selector.vue";

const enUS = { cultureName: "en-US", twoLetterLanguageName: "en", nativeName: "English (United States)" };
const enGB = { cultureName: "en-GB", twoLetterLanguageName: "en", nativeName: "English (United Kingdom)" };
const deDE = { cultureName: "de-DE", twoLetterLanguageName: "de", nativeName: "Deutsch (Deutschland)" };

const SLUG = "products-with-options/dreamy-cakes/vintage-wedding-cake";

const hoisted = vi.hoisted(() => ({
  state: {} as {
    currentLanguage: { value: { cultureName: string } };
    previousCultureSlug: { value: { cultureName: string; slug: string } };
  },
  getSlugInfo: vi.fn(),
}));

vi.mock("@/core/composables/useLanguages", () => ({
  useLanguages: () => ({
    supportedLanguages: ref([enUS, enGB, deDE]),
    currentLanguage: hoisted.state.currentLanguage,
    pinLocale: vi.fn(),
    removeLocaleFromUrl: vi.fn(),
    previousCultureSlug: hoisted.state.previousCultureSlug,
    getUrlWithoutLocale: (path: string) => path.replace(/^\/(en-GB|de)\//, "/"),
  }),
}));

vi.mock("@/core/api/graphql/slugInfo/queries/getSlugInfo", () => ({ getSlugInfo: hoisted.getSlugInfo }));

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
  emits: { click: () => true },
  template: `<div class="menu-item" v-bind="$attrs" @click="$emit('click')"><slot /></div>`,
});

function mountSelector() {
  return mount(LanguageSelector, {
    global: {
      stubs: { VcDropdownMenu: VcDropdownMenuStub, VcMenuItem: VcMenuItemStub, VcIcon: true, VcImage: true },
      mocks: { $t: (key: string) => key },
    },
  });
}

async function selectLanguage(cultureName: string) {
  await mountSelector().find(`[data-culture-name="${cultureName}"]`).trigger("click");
  await flushPromises();
}

describe("LanguageSelector — slug that exists in one language only", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    hoisted.getSlugInfo.mockReset();
    hoisted.getSlugInfo.mockResolvedValue({ entityInfo: null });
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { pathname: `/en-GB/${SLUG}`, reload: vi.fn() },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
  });

  it("keeps the culture that owns the slug when the current page is shown through the fallback", async () => {
    // en-GB is showing the de-DE slug through the fallback set on the previous switch.
    hoisted.state.currentLanguage = ref(enGB);
    hoisted.state.previousCultureSlug = ref({ cultureName: "de-DE", slug: SLUG });

    await selectLanguage("en-US");

    expect(hoisted.state.previousCultureSlug.value).toEqual({ cultureName: "de-DE", slug: SLUG });
  });

  it("stores the current culture when the current page was resolved in that culture", async () => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { pathname: `/de/${SLUG}`, reload: vi.fn() },
    });
    hoisted.state.currentLanguage = ref(deDE);
    hoisted.state.previousCultureSlug = ref({ cultureName: "en-US", slug: "product/c94d730a" });

    await selectLanguage("en-GB");

    expect(hoisted.state.previousCultureSlug.value).toEqual({ cultureName: "de-DE", slug: SLUG });
  });
});
