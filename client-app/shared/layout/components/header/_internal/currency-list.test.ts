import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VcMenuItem } from "@/ui-kit/components/molecules";
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

function mountList() {
  return mount(CurrencyList, {
    attachTo: document.body,
    global: {
      components: { VcMenuItem },
      stubs: { VcScrollbar: { template: "<div><slot /></div>" } },
    },
  });
}

function option(wrapper: ReturnType<typeof mountList>, code: string) {
  return wrapper.get(`[data-currency-code="${code}"] [role="option"]`);
}

beforeEach(() => {
  state.currentLanguage.value = { cultureName: "de-DE" };
  state.selectCurrency.mockReset();
});

describe("CurrencyList", () => {
  it("marks the current currency as the selected option", () => {
    const wrapper = mountList();

    expect(["USD", "EUR"].map((code) => option(wrapper, code).attributes("aria-selected"))).toEqual(["true", "false"]);
  });

  it("names each currency in the page language", () => {
    expect(option(mountList(), "USD").text()).toContain("US-Dollar");
  });

  it("starts a name in lower-case languages with a capital", () => {
    state.currentLanguage.value = { cultureName: "fr-FR" };

    expect(option(mountList(), "USD").text()).toContain("Dollar des États-Unis");
  });

  it("falls back to the platform's English name for a code the browser does not know", () => {
    expect(option(mountList(), "QQQ").text()).toContain("Store points");
  });

  it("keeps the symbol out of the option's name", () => {
    const symbol = option(mountList(), "USD").get('[aria-hidden="true"]');

    expect(symbol.text()).toBe("$");
  });

  it("starts the switch and reports the choice", async () => {
    const wrapper = mountList();

    await option(wrapper, "EUR").trigger("click");

    expect(state.selectCurrency).toHaveBeenCalledWith("EUR");
    expect(wrapper.emitted("select")).toHaveLength(1);
  });
});
