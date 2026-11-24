import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { VcMenuItem, VcMenuList } from "@/ui-kit/components/molecules";
import CurrencyList from "./currency-list.vue";

const state = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    currentCurrency: ref({ code: "USD" }),
    supportedCurrencies: ref([
      { code: "USD", symbol: "$", englishName: "US Dollar" },
      { code: "EUR", symbol: "€", englishName: "Euro" },
      { code: "QQQ", symbol: "¤", englishName: "Store points" },
    ]),
    currentLanguage: ref({ cultureName: "de-DE" }),
    selectCurrency: vi.fn(),
  };
});

vi.mock("@/shared/layout/composables/useCurrencySwitch", () => ({
  useCurrencySwitch: () => ({
    currentCurrency: state.currentCurrency,
    supportedCurrencies: state.supportedCurrencies,
    selectCurrency: state.selectCurrency,
  }),
}));

vi.mock("@/core/composables/useLanguages", () => ({
  useLanguages: () => ({ currentLanguage: state.currentLanguage }),
}));

enableAutoUnmount(afterEach);

async function mountList() {
  const wrapper = mount(CurrencyList, {
    attachTo: document.body,
    attrs: { "aria-labelledby": "currency-heading" },
    global: {
      components: { VcMenuItem, VcMenuList },
      stubs: { VcScrollbar: { template: "<div><slot /></div>" } },
    },
  });
  // The options join the listbox once they are in the DOM.
  await nextTick();
  return wrapper;
}

function option(wrapper: Awaited<ReturnType<typeof mountList>>, code: string) {
  return wrapper.get(`[data-currency-code="${code}"] [role="option"]`);
}

beforeEach(() => {
  state.currentLanguage.value = { cultureName: "de-DE" };
  state.selectCurrency.mockReset();
});

describe("CurrencyList", () => {
  it("is a listbox named by the heading its parent gives", async () => {
    const listbox = (await mountList()).get('[role="listbox"]');

    expect(listbox.attributes("aria-labelledby")).toBe("currency-heading");
    expect(listbox.attributes("data-test-id")).toBe("preferences-menu-currencies");
  });

  it("marks the current currency as the selected option", async () => {
    const wrapper = await mountList();

    expect(["USD", "EUR"].map((code) => option(wrapper, code).attributes("aria-selected"))).toEqual(["true", "false"]);
  });

  it("is one tab stop: the current currency", async () => {
    const wrapper = await mountList();

    expect(["USD", "EUR", "QQQ"].map((code) => option(wrapper, code).attributes("tabindex"))).toEqual([
      "0",
      "-1",
      "-1",
    ]);
  });

  it("names each currency in the page language", async () => {
    expect(option(await mountList(), "USD").text()).toContain("US-Dollar");
  });

  it("starts a name in lower-case languages with a capital", async () => {
    state.currentLanguage.value = { cultureName: "fr-FR" };

    expect(option(await mountList(), "USD").text()).toContain("Dollar des États-Unis");
  });

  it("falls back to the platform's English name for a code the browser does not know", async () => {
    expect(option(await mountList(), "QQQ").text()).toContain("Store points");
  });

  it("keeps the symbol out of the option's name", async () => {
    const symbol = option(await mountList(), "USD").get('[aria-hidden="true"]');

    expect(symbol.text()).toBe("$");
  });

  it("starts the switch and reports the choice", async () => {
    const wrapper = await mountList();

    await option(wrapper, "EUR").trigger("click");

    expect(state.selectCurrency).toHaveBeenCalledWith("EUR");
    expect(wrapper.emitted("select")).toHaveLength(1);
  });
});
