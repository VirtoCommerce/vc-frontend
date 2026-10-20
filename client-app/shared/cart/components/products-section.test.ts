import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import ProductsSection from "./products-section.vue";
import type { LineItemType } from "@/core/api/graphql/types";

const items = [{ id: "line-1" }, { id: "line-2" }] as LineItemType[];

const global = {
  stubs: {
    VcWidget: { template: "<div><slot /></div>" },
    VcChip: { template: "<span><slot /></span>" },
    VcButton: true,
    VcRating: true,
    CartLineItems: true,
  },
  mocks: {
    $cfg: { vendor_rating_enabled: false },
    $t: (key: string, params?: Record<string, string>) => (params ? `${key}:${Object.values(params).join()}` : key),
  },
};

function groupNames(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll("[role='group']").map((group) => {
    const labelId = group.attributes("aria-labelledby");
    return wrapper.find(`[id='${labelId}']`).text();
  });
}

describe("ProductsSection groups", () => {
  it("names each vendor group and each other-currency group after its heading", () => {
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

    expect(groupNames(wrapper)).toEqual([
      "common.labels.vendor_name:Acme",
      "common.labels.vendor_name:Globex",
      "common.labels.products_in_currency:EUR",
    ]);
  });

  it("keeps the ungrouped list out of any group", () => {
    const wrapper = mount(ProductsSection, { props: { grouped: false, items }, global });

    expect(wrapper.findAll("[role='group']")).toHaveLength(0);
  });
});
