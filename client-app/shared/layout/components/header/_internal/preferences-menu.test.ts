import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { VcPopover } from "@/ui-kit/components/molecules";
import PreferencesMenu from "./preferences-menu.vue";
import type { VueWrapper } from "@vue/test-utils";

const state = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    isCurrencyShown: ref(true),
    isAppearanceShown: ref(true),
    isLanguageShown: ref(true),
    hasPreferences: ref(true),
    currentCurrency: ref({ code: "USD" }),
    currentLanguage: ref({ twoLetterLanguageName: "en" }),
  };
});

vi.mock("@/shared/layout/composables/usePreferencesMenu", () => ({
  usePreferencesMenu: () => ({
    isCurrencyShown: state.isCurrencyShown,
    isAppearanceShown: state.isAppearanceShown,
    isLanguageShown: state.isLanguageShown,
    hasPreferences: state.hasPreferences,
  }),
}));

vi.mock("@/core/composables/useCurrency", () => ({
  useCurrency: () => ({ currentCurrency: state.currentCurrency }),
}));

vi.mock("@/core/composables/useLanguages", () => ({
  useLanguages: () => ({ currentLanguage: state.currentLanguage }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string, params: Record<string, string>) => `${key} ${JSON.stringify(params)}` }),
}));

// A failed assertion skips a trailing unmount(), and these suites read document.activeElement.
enableAutoUnmount(afterEach);

function listStub(name: string) {
  return defineComponent({
    name,
    emits: { select: () => true },
    template: `<button type="button" data-test-id="test-${name}" @click="$emit('select')">${name}</button>`,
  });
}

const Page = defineComponent({
  components: { PreferencesMenu },

  template: `
    <div>
      <PreferencesMenu :item="{ id: 'preferences', title: 'Preferences' }" />
      <a data-test-id="test-next" href="#">All products</a>
    </div>
  `,
});

function mountPage(): VueWrapper {
  return mount(Page, {
    attachTo: document.body,
    global: {
      components: { VcPopover },
      stubs: {
        CurrencyList: listStub("CurrencyList"),
        LanguageList: listStub("LanguageList"),
        ColorModeSwitch: true,
        VcIcon: true,
      },
      mocks: { $t: (key: string) => key },
    },
  });
}

function trigger(wrapper: VueWrapper) {
  return wrapper.get('[data-test-id="preferences-menu-button"]');
}

async function open(wrapper: VueWrapper): Promise<void> {
  await trigger(wrapper).trigger("click");
  await flushPromises();
  expect(trigger(wrapper).attributes("aria-expanded")).toBe("true");
}

type FlagType = "isCurrencyShown" | "isAppearanceShown" | "isLanguageShown";

function headings(wrapper: VueWrapper): (string | undefined)[] {
  return wrapper.findAll(".preferences-menu__heading").map((heading) => heading.text().split(".").at(-1));
}

beforeEach(() => {
  state.isCurrencyShown.value = true;
  state.isAppearanceShown.value = true;
  state.isLanguageShown.value = true;
  state.hasPreferences.value = true;
});

describe("PreferencesMenu: trigger", () => {
  it("renders nothing when the store offers no choice", () => {
    state.hasPreferences.value = false;

    expect(mountPage().find('[data-test-id="preferences-menu-button"]').exists()).toBe(false);
  });

  it("shows the current currency and language", () => {
    expect(mountPage().get('[data-test-id="preferences-menu-value"]').text()).toBe("USD · EN");
  });

  it("leaves out the currency where the panel offers none", () => {
    state.isCurrencyShown.value = false;

    expect(mountPage().get('[data-test-id="preferences-menu-value"]').text()).toBe("EN");
  });

  it("leaves out the language where the panel offers none", () => {
    state.isLanguageShown.value = false;

    expect(mountPage().get('[data-test-id="preferences-menu-value"]').text()).toBe("USD");
  });

  it("shows the menu title, named by it alone, when only the appearance is offered", () => {
    state.isCurrencyShown.value = false;
    state.isLanguageShown.value = false;

    const wrapper = mountPage();

    expect(wrapper.get('[data-test-id="preferences-menu-value"]').text()).toBe("Preferences");
    expect(trigger(wrapper).attributes("aria-label")).toBeUndefined();
  });

  it("names the trigger by the menu title and its value", () => {
    expect(trigger(mountPage()).attributes("aria-label")).toBe(
      'shared.layout.header.preferences_menu.trigger_label {"title":"Preferences","value":"USD · EN"}',
    );
  });
});

describe("PreferencesMenu: panel", () => {
  it.each(["CurrencyList", "LanguageList"])("closes once a choice is made in the %s", async (list) => {
    const wrapper = mountPage();
    await open(wrapper);

    await wrapper.get(`[data-test-id="test-${list}"]`).trigger("click");
    await flushPromises();

    expect(trigger(wrapper).attributes("aria-expanded")).toBe("false");
  });

  it.each<[string, FlagType[], string[], boolean]>([
    ["nothing", [], ["currency", "appearance", "language"], false],
    ["the currency", ["isCurrencyShown"], ["appearance", "language"], false],
    ["the appearance", ["isAppearanceShown"], ["currency", "language"], false],
    ["the language", ["isLanguageShown"], ["currency", "appearance"], true],
    ["the currency and the appearance", ["isCurrencyShown", "isAppearanceShown"], ["language"], true],
  ])("shows only the groups on offer, %s left out", async (_, hidden, groups, isSingle) => {
    hidden.forEach((flag) => {
      state[flag].value = false;
    });
    const wrapper = mountPage();
    await open(wrapper);

    expect(headings(wrapper)).toEqual(groups);
    expect(wrapper.findAll(".preferences-menu__column")).toHaveLength(isSingle ? 1 : 2);
    expect(wrapper.get('[data-test-id="preferences-menu-panel"]').classes("preferences-menu__panel--single")).toBe(
      isSingle,
    );
  });

  it("names the currency list, the appearance switch and the language list by their headings", async () => {
    const wrapper = mountPage();
    await open(wrapper);
    const ids = wrapper.findAll(".preferences-menu__heading").map((heading) => heading.attributes("id"));
    const named = [
      '[data-test-id="test-CurrencyList"]',
      "color-mode-switch-stub",
      '[data-test-id="test-LanguageList"]',
    ];

    expect(named.map((selector) => wrapper.get(selector).attributes("aria-labelledby"))).toEqual(ids);
  });

  it("closes on Escape after focus has left the panel", async () => {
    const wrapper = mountPage();
    await open(wrapper);
    const next = wrapper.get<HTMLElement>('[data-test-id="test-next"]').element;
    next.focus();

    next.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await flushPromises();

    expect(trigger(wrapper).attributes("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(next);
  });
});
