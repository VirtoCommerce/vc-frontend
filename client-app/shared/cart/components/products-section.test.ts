import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createI18n } from "vue-i18n";
import { VcChip } from "@/ui-kit/components/molecules";
import ProductsSection from "./products-section.vue";
import type { LineItemType } from "@/core/api/graphql/types";

const items = [{ id: "line-1" }, { id: "line-2" }] as LineItemType[];

const global = {
  plugins: [createI18n({ locale: "en", legacy: false, messages: {}, missingWarn: false })],
  components: { VcChip },
  stubs: {
    VcWidget: { template: "<div><slot /></div>" },
    VcButton: true,
    VcIcon: true,
    VcRating: true,
    CartLineItems: true,
  },
  mocks: {
    $cfg: { vendor_rating_enabled: false },
    $t: (key: string, params?: Record<string, string>) => (params ? `${key}:${Object.values(params).join()}` : key),
  },
};

function describeGroups(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll("fieldset, [role='group']").map((group) => ({
    name: wrapper.find(`[id='${group.attributes("aria-labelledby")}']`).text(),
    containsList: group.find("cart-line-items-stub").exists(),
  }));
}

describe("ProductsSection groups", () => {
  it("wraps each vendor and other-currency list in a group named after its heading", () => {
    const wrapper = mount(ProductsSection, {
      props: {
        grouped: true,
        itemsGroupedByVendor: [
          { vendor: { id: "v1", name: "Acme" }, items: [items[0]] },
          { vendor: { id: "v2", name: "Globex" }, items: [items[1]] },
        ],
        otherCurrencyGroups: [{ currencyCode: "EUR", items }],
      },
      global,
    });

    expect(describeGroups(wrapper)).toEqual([
      { name: "common.labels.vendor_name:Acme", containsList: true },
      { name: "common.labels.vendor_name:Globex", containsList: true },
      { name: "common.labels.products_in_currency:EUR", containsList: true },
    ]);
  });

  it("keeps the ungrouped list out of any group", () => {
    const wrapper = mount(ProductsSection, { props: { grouped: false, items }, global });

    expect(wrapper.find("cart-line-items-stub").exists()).toBe(true);
    expect(wrapper.findAll("fieldset, [role='group']")).toHaveLength(0);
  });
});
